import { SynthUtils } from "@aws-cdk/assert"
import { Stack } from "@aws-cdk/core"

import { ServiceStack } from "../infra/stack"

test("DB stack validation", () => {
    const stack = new Stack();
    const service_stack = new ServiceStack(stack, 'service_stack');
    const received = SynthUtils.toCloudFormation(service_stack);
    expect(SynthUtils.toCloudFormation(service_stack)).toMatchSnapshot();
});