const responseSwaggerSchema = {
	globalResponse: {
		type: 'object',
		properties: {
			requestTime: { type: 'string', example: new Date().toISOString() },
			status: { type: 'string', example: 'success' },
			message: { type: 'string', example: 'message' }
		}
	}
};

export default responseSwaggerSchema;
