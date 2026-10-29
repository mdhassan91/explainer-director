import { Composition } from "remotion";
import { LibCatalog } from "./lib/Catalog";
import { Example, ExampleSamples, Example_FRAMES, Example_SAMPLES } from "./example/Example";
export const Root = () => (
  <>
    <Composition id="Example" component={Example} durationInFrames={Math.max(1, Example_FRAMES)} fps={24} width={1920} height={1080} />
    <Composition id="ExampleSamples" component={ExampleSamples} durationInFrames={Math.max(1, Example_SAMPLES)} fps={24} width={1920} height={1080} />
    <Composition id="LibCatalog" component={LibCatalog} durationInFrames={4} fps={24} width={1920} height={1080} />
  </>
);
