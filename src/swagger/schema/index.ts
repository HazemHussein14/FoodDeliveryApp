import userSwaggerSchema from './user.schema';
import productSwaggerSchema from './product.schema';
import cartSwaggerSchema from './cart.schema';
import responseSwaggerSchema from './response.schema';

const swaggerSchemas = {
	...userSwaggerSchema,
	...productSwaggerSchema,
	...cartSwaggerSchema,
	...responseSwaggerSchema
};

export default swaggerSchemas;
