export const DEMO_CLASSES = [
  'Stable land',
  'Open water',
  'Seasonal inundation',
  'Persistent transition candidate',
] as const;

export type DemoClass = (typeof DEMO_CLASSES)[number];
export type SarFeatures = [number, number, number, number];
export type SarSample = { x: SarFeatures; y: DemoClass };

export const FEATURE_NAMES = [
  'Pre-event HH backscatter',
  'Post-event HH backscatter',
  'Stage-difference index',
  'Later-water persistence',
] as const;

type Leaf = { prediction: DemoClass };
type Branch = { feature: number; threshold: number; left: Tree; right: Tree };
type Tree = Leaf | Branch;
type Random = () => number;

function seededRandom(seed: number): Random {
  let value = seed >>> 0;
  return () => {
    value += 0x6D2B79F5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(random: Random, mean = 0, standardDeviation = 1) {
  const u = Math.max(random(), 1e-9);
  const v = random();
  return mean + standardDeviation * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function clamp(value: number, low: number, high: number) {
  return Math.min(high, Math.max(low, value));
}

export function createSyntheticSamples(seed = 2609, perClass = 180): SarSample[] {
  const random = seededRandom(seed);
  const samples: SarSample[] = [];
  for (const label of DEMO_CLASSES) {
    for (let i = 0; i < perClass; i += 1) {
      let pre: number;
      let post: number;
      let stageIndex: number;
      let persistence: number;
      if (label === 'Stable land') {
        pre = gaussian(random, -9.5, 2.8);
        post = pre + gaussian(random, 0, 1.8);
        stageIndex = Math.abs(gaussian(random, 0.07, 0.05));
        persistence = clamp(gaussian(random, 0.08, 0.1), 0, 1);
      } else if (label === 'Open water') {
        pre = gaussian(random, -19, 2.7);
        post = pre + gaussian(random, 0, 1.8);
        stageIndex = Math.abs(gaussian(random, 0.07, 0.05));
        persistence = clamp(gaussian(random, 0.92, 0.1), 0, 1);
      } else if (label === 'Seasonal inundation') {
        pre = gaussian(random, -9.5, 2.8);
        post = gaussian(random, -17.5, 2.8);
        stageIndex = Math.abs(gaussian(random, 0.42, 0.16));
        persistence = clamp(gaussian(random, 0.18, 0.16), 0, 1);
      } else {
        pre = gaussian(random, -9.5, 2.8);
        post = gaussian(random, -17.5, 2.8);
        stageIndex = Math.abs(gaussian(random, 0.07, 0.05));
        persistence = clamp(gaussian(random, 0.91, 0.11), 0, 1);
      }
      samples.push({ x: [clamp(pre, -28, -2), clamp(post, -28, -2), clamp(stageIndex, 0, 1), persistence], y: label });
    }
  }
  return samples;
}

function gini(samples: SarSample[]) {
  if (!samples.length) return 0;
  const counts = new Map<DemoClass, number>();
  samples.forEach((sample) => counts.set(sample.y, (counts.get(sample.y) ?? 0) + 1));
  return 1 - [...counts.values()].reduce((sum, count) => sum + (count / samples.length) ** 2, 0);
}

function majority(samples: SarSample[]): DemoClass {
  const counts = new Map<DemoClass, number>();
  samples.forEach((sample) => counts.set(sample.y, (counts.get(sample.y) ?? 0) + 1));
  return DEMO_CLASSES.reduce((best, label) => (counts.get(label) ?? 0) > (counts.get(best) ?? 0) ? label : best, DEMO_CLASSES[0]);
}

function shuffled<T>(items: T[], random: Random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function trainTree(samples: SarSample[], random: Random, depth = 0): Tree {
  const prediction = majority(samples);
  if (depth >= 5 || samples.length < 10 || gini(samples) < 1e-6) return { prediction };

  const features = shuffled([0, 1, 2, 3], random).slice(0, 2);
  const parentImpurity = gini(samples);
  let best: { feature: number; threshold: number; gain: number; left: SarSample[]; right: SarSample[] } | null = null;

  for (const feature of features) {
    const values = [...new Set(samples.map((sample) => sample.x[feature]))].sort((a, b) => a - b);
    if (values.length < 2) continue;
    const candidates = Array.from({ length: Math.min(18, values.length - 1) }, (_, i) => {
      const index = Math.min(values.length - 2, Math.floor(((i + 1) / (Math.min(18, values.length - 1) + 1)) * values.length));
      return (values[index] + values[index + 1]) / 2;
    });
    for (const threshold of candidates) {
      const left = samples.filter((sample) => sample.x[feature] <= threshold);
      const right = samples.filter((sample) => sample.x[feature] > threshold);
      if (left.length < 4 || right.length < 4) continue;
      const gain = parentImpurity - (left.length / samples.length) * gini(left) - (right.length / samples.length) * gini(right);
      if (!best || gain > best.gain) best = { feature, threshold, gain, left, right };
    }
  }
  if (!best || best.gain <= 1e-6) return { prediction };
  return {
    feature: best.feature,
    threshold: best.threshold,
    left: trainTree(best.left, random, depth + 1),
    right: trainTree(best.right, random, depth + 1),
  };
}

function predictTree(tree: Tree, features: SarFeatures): DemoClass {
  if ('prediction' in tree) return tree.prediction;
  return predictTree(features[tree.feature] <= tree.threshold ? tree.left : tree.right, features);
}

export type Forest = { trees: Tree[]; predict: (features: SarFeatures) => Record<DemoClass, number> };
export type DemoClassifier = { predict: (features: SarFeatures) => Record<DemoClass, number> };

export function normalizedVoteEntropy(votes: Record<DemoClass, number>) {
  const terms = Object.values(votes).filter((value) => value > 0).map((value) => -value * Math.log(value));
  return terms.reduce((sum, value) => sum + value, 0) / Math.log(DEMO_CLASSES.length);
}

export function trainSyntheticForest(samples: SarSample[], seed = 941, treeCount = 31): Forest {
  const random = seededRandom(seed);
  const trees = Array.from({ length: treeCount }, () => {
    const bootstrap = Array.from({ length: samples.length }, () => samples[Math.floor(random() * samples.length)]);
    return trainTree(bootstrap, random);
  });
  return {
    trees,
    predict(features) {
      const counts = Object.fromEntries(DEMO_CLASSES.map((label) => [label, 0])) as Record<DemoClass, number>;
      trees.forEach((tree) => { counts[predictTree(tree, features)] += 1; });
      return Object.fromEntries(DEMO_CLASSES.map((label) => [label, counts[label] / trees.length])) as Record<DemoClass, number>;
    },
  };
}

export function splitSyntheticSamples(samples: SarSample[], seed = 2031) {
  const random = seededRandom(seed);
  const byClass = DEMO_CLASSES.map((label) => shuffled(samples.filter((sample) => sample.y === label), random));
  const train: SarSample[] = [];
  const validation: SarSample[] = [];
  const test: SarSample[] = [];
  byClass.forEach((group) => {
    const trainCutoff = Math.floor(group.length * 0.7);
    const validationCutoff = Math.floor(group.length * 0.85);
    train.push(...group.slice(0, trainCutoff));
    validation.push(...group.slice(trainCutoff, validationCutoff));
    test.push(...group.slice(validationCutoff));
  });
  return { train, validation, test };
}

export function accuracy(model: DemoClassifier, samples: SarSample[], override?: (sample: SarSample) => SarFeatures) {
  if (!samples.length) return 0;
  let correct = 0;
  for (const sample of samples) {
    const prediction = model.predict(override ? override(sample) : sample.x);
    const best = DEMO_CLASSES.reduce((winner, label) => prediction[label] > prediction[winner] ? label : winner, DEMO_CLASSES[0]);
    if (best === sample.y) correct += 1;
  }
  return correct / samples.length;
}

export function confusionMatrix(model: DemoClassifier, samples: SarSample[]) {
  const matrix = Object.fromEntries(DEMO_CLASSES.map((actual) => [actual, Object.fromEntries(DEMO_CLASSES.map((predicted) => [predicted, 0]))])) as Record<DemoClass, Record<DemoClass, number>>;
  for (const sample of samples) {
    const scores = model.predict(sample.x);
    const predicted = DEMO_CLASSES.reduce((winner, label) => scores[label] > scores[winner] ? label : winner, DEMO_CLASSES[0]);
    matrix[sample.y][predicted] += 1;
  }
  return matrix;
}

export function macroF1(matrix: Record<DemoClass, Record<DemoClass, number>>) {
  const scores = DEMO_CLASSES.map((label) => {
    const truePositive = matrix[label][label];
    const actual = DEMO_CLASSES.reduce((sum, actualLabel) => sum + matrix[label][actualLabel], 0);
    const predicted = DEMO_CLASSES.reduce((sum, actualLabel) => sum + matrix[actualLabel][label], 0);
    const precision = predicted ? truePositive / predicted : 0;
    const recall = actual ? truePositive / actual : 0;
    return precision + recall ? 2 * precision * recall / (precision + recall) : 0;
  });
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

export function permutationImportance(model: DemoClassifier, samples: SarSample[]) {
  const baseline = accuracy(model, samples);
  const random = seededRandom(8801);
  const indexBySample = new Map(samples.map((sample, index) => [sample, index]));
  return FEATURE_NAMES.map((name, feature) => {
    const permuted = shuffled(samples.map((sample) => sample.x[feature]), random);
    const score = accuracy(model, samples, (sample) => {
      const sampleIndex = indexBySample.get(sample) ?? 0;
      const changed: SarFeatures = [...sample.x];
      changed[feature] = permuted[sampleIndex];
      return changed;
    });
    return { name, score: baseline - score };
  }).sort((a, b) => b.score - a.score);
}
