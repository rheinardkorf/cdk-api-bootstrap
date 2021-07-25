import { SynthUtils } from "@aws-cdk/assert"
import { Stack } from "@aws-cdk/core"

import { SeederStack } from "../infra/stack"

test("DB Seeder stack validation", () => {
    const stack = new Stack();
    const seeder_stack = new SeederStack(stack, 'seeder_stack');
    const received = SynthUtils.toCloudFormation(seeder_stack);
    expect(SynthUtils.toCloudFormation(seeder_stack)).toMatchSnapshot();
});