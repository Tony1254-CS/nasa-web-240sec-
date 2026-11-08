export interface WatchPlace {id:string;name:string;kind:string;sourceUrl:string;coordinates:[number,number];changeCoordinates:[number,number];distanceM:number;intersects:boolean;findingId:string;findingAreaHa:number;findingGeometry:GeoJSON.Polygon|GeoJSON.MultiPolygon}
export interface WatchRegion {runId:string;pair:[string,string];sourceAssetCount:number;eligibleWithin5km:number;selection:string;assetSha256:string;findingSha256:string;assetSource:{retrieved_at:string;osm_timestamp:string;osm_attribution:string;osm_license_url:string};rows:WatchPlace[]}
export interface PlaceWatchCatalogue {schema:number;method:string;regions:Record<'jamuna'|'sundarbans',WatchRegion>}
/** User-assumed gap-spanning scenario, not an erosion/failure forecast. */
export function contactScenario(distanceM:number,rateMPerMonth:number,horizonDays:number){
 if(!Number.isFinite(distanceM)||distanceM<0||!Number.isFinite(rateMPerMonth)||rateMPerMonth<=0||!Number.isFinite(horizonDays)||horizonDays<=0)throw new Error('Positive scenario rate/horizon and a non-negative distance are required.');
 const days=Math.ceil(distanceM/(rateMPerMonth/30));
 return {days,withinHorizon:days<=horizonDays,reachM:rateMPerMonth/30*horizonDays,assumedRateMPerMonth:rateMPerMonth,monthDays:30,predictedFailureDate:null};
}
