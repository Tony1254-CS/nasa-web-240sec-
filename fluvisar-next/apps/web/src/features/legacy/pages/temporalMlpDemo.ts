import { DEMO_CLASSES, type DemoClass, type DemoClassifier, type SarFeatures, type SarSample } from './sarForestDemo';

type DenseLayer = { weights: number[][]; bias: number[] };
type Network = { first: DenseLayer; second: DenseLayer; output: DenseLayer };
type Example = { x: number[]; y: number };
export type LossPoint = { epoch: number; train: number; validation: number };

function rngFrom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(items: T[], random: () => number) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

function neuralFeatures(features: SarFeatures) {
  const followup = 10 * Math.log10(10 ** (features[0] / 10) * (1 - features[3]) + 10 ** (features[1] / 10) * features[3]);
  return [(features[0] + 15) / 10, (features[1] + 15) / 10, (followup + 15) / 10, features[2] * 2 - 1];
}

function encode(samples: SarSample[]): Example[] {
  return samples.map((sample) => ({ x: neuralFeatures(sample.x), y: DEMO_CLASSES.indexOf(sample.y) }));
}

function createLayer(inputSize: number, outputSize: number, random: () => number): DenseLayer {
  const limit = Math.sqrt(6 / (inputSize + outputSize));
  return {
    weights: Array.from({ length: inputSize }, () => Array.from({ length: outputSize }, () => (random() * 2 - 1) * limit)),
    bias: Array.from({ length: outputSize }, () => 0),
  };
}

function createNetwork(seed: number): Network {
  const random = rngFrom(seed);
  return {
    first: createLayer(4, 16, random),
    second: createLayer(16, 8, random),
    output: createLayer(8, DEMO_CLASSES.length, random),
  };
}

function dense(input: number[], layer: DenseLayer) {
  return layer.bias.map((bias, output) => input.reduce((sum, value, index) => sum + value * layer.weights[index][output], bias));
}

function softmax(values: number[]) {
  const max = Math.max(...values);
  const exponents = values.map((value) => Math.exp(value - max));
  const denominator = exponents.reduce((sum, value) => sum + value, 0);
  return exponents.map((value) => value / denominator);
}

function forward(network: Network, input: number[]) {
  const firstPreActivation = dense(input, network.first);
  const firstActivation = firstPreActivation.map((value) => Math.max(0, value));
  const secondPreActivation = dense(firstActivation, network.second);
  const secondActivation = secondPreActivation.map((value) => Math.max(0, value));
  const probabilities = softmax(dense(secondActivation, network.output));
  return { firstPreActivation, firstActivation, secondPreActivation, secondActivation, probabilities };
}

function crossEntropy(network: Network, examples: Example[]) {
  if (!examples.length) return 0;
  const total = examples.reduce((sum, example) => sum - Math.log(Math.max(forward(network, example.x).probabilities[example.y], 1e-9)), 0);
  return total / examples.length;
}

function copyNetwork(network: Network): Network {
  const clone = (layer: DenseLayer): DenseLayer => ({ weights: layer.weights.map((row) => [...row]), bias: [...layer.bias] });
  return { first: clone(network.first), second: clone(network.second), output: clone(network.output) };
}

function updateBatch(network: Network, examples: Example[], learningRate: number) {
  const layers = [network.first, network.second, network.output];
  const gradientWeights = layers.map((layer) => layer.weights.map((row) => row.map(() => 0)));
  const gradientBias = layers.map((layer) => layer.bias.map(() => 0));

  for (const example of examples) {
    const pass = forward(network, example.x);
    const deltaOutput = pass.probabilities.map((probability, index) => (probability - Number(index === example.y)) / examples.length);
    const deltaSecond = pass.secondActivation.map((activation, inputIndex) => {
      const propagated = deltaOutput.reduce((sum, delta, outputIndex) => sum + network.output.weights[inputIndex][outputIndex] * delta, 0);
      return activation > 0 ? propagated : 0;
    });
    const deltaFirst = pass.firstActivation.map((activation, inputIndex) => {
      const propagated = deltaSecond.reduce((sum, delta, outputIndex) => sum + network.second.weights[inputIndex][outputIndex] * delta, 0);
      return activation > 0 ? propagated : 0;
    });

    pass.secondActivation.forEach((activation, inputIndex) => deltaOutput.forEach((delta, outputIndex) => { gradientWeights[2][inputIndex][outputIndex] += activation * delta; }));
    deltaOutput.forEach((delta, index) => { gradientBias[2][index] += delta; });
    pass.firstActivation.forEach((activation, inputIndex) => deltaSecond.forEach((delta, outputIndex) => { gradientWeights[1][inputIndex][outputIndex] += activation * delta; }));
    deltaSecond.forEach((delta, index) => { gradientBias[1][index] += delta; });
    example.x.forEach((activation, inputIndex) => deltaFirst.forEach((delta, outputIndex) => { gradientWeights[0][inputIndex][outputIndex] += activation * delta; }));
    deltaFirst.forEach((delta, index) => { gradientBias[0][index] += delta; });
  }

  layers.forEach((layer, layerIndex) => {
    layer.weights.forEach((row, inputIndex) => row.forEach((weight, outputIndex) => {
      const decay = layerIndex === 2 ? 0.0005 * weight : 0;
      layer.weights[inputIndex][outputIndex] = weight - learningRate * (gradientWeights[layerIndex][inputIndex][outputIndex] + decay);
    }));
    layer.bias.forEach((value, index) => { layer.bias[index] = value - learningRate * gradientBias[layerIndex][index]; });
  });
}

export function trainTemporalMlp(trainingSamples: SarSample[], validationSamples: SarSample[], seed = 4021): {
  model: DemoClassifier;
  history: LossPoint[];
  bestEpoch: number;
} {
  const training = encode(trainingSamples);
  const validation = encode(validationSamples);
  const random = rngFrom(seed);
  const network = createNetwork(seed + 29);
  const history: LossPoint[] = [];
  let bestLoss = Number.POSITIVE_INFINITY;
  let bestNetwork = copyNetwork(network);
  let bestEpoch = 0;
  let staleEpochs = 0;
  const maxEpochs = 140;

  for (let epoch = 1; epoch <= maxEpochs; epoch += 1) {
    const order = shuffled(training, random);
    for (let start = 0; start < order.length; start += 24) updateBatch(network, order.slice(start, start + 24), 0.018);
    const trainLoss = crossEntropy(network, training);
    const validationLoss = crossEntropy(network, validation);
    history.push({ epoch, train: trainLoss, validation: validationLoss });
    if (validationLoss < bestLoss - 0.0005) {
      bestLoss = validationLoss;
      bestNetwork = copyNetwork(network);
      bestEpoch = epoch;
      staleEpochs = 0;
    } else {
      staleEpochs += 1;
      if (staleEpochs >= 18) break;
    }
  }

  const model: DemoClassifier = {
    predict(features) {
      const scores = forward(bestNetwork, neuralFeatures(features)).probabilities;
      return Object.fromEntries(DEMO_CLASSES.map((label, index) => [label, scores[index]])) as Record<DemoClass, number>;
    },
  };
  return { model, history, bestEpoch };
}
