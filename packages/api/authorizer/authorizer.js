exports.authorizer = async function (event) {
    
    const methodArn = event.methodArn;
    
    // 1. Get the token from the request.

    // 2. Validate the token.

    // 3. Determine user scope.

    // 4. Generate IAM policy document for the request. Deny or Allow will do.

    // Example:
    // Real token won't be a string to cast to lower case.
    // Instead pass it on the an IDP to get authentication details.
    const token = event.authorizationToken.toLowerCase();
    switch (token) {
        case 'allow':
            return generateAuthResponse('user', 'Allow', methodArn, { exampleContextKey: 'just an example' });
        default:
            return generateAuthResponse('user', 'Deny', methodArn);
    }
}

function generateAuthResponse(principalId, effect, methodArn, context = {}) {
    const policyDocument = generatePolicyDocument(effect, methodArn);

    return {
        principalId,
        policyDocument,
        context,
    }
}

function generatePolicyDocument(effect, methodArn) {
    if (!effect || !methodArn) return null

    const policyDocument = {
        Version: '2012-10-17',
        Statement: [{
            Action: 'execute-api:Invoke',
            Effect: effect,
            Resource: methodArn
        }]
    };

    return policyDocument;
}