import userSwaggerSchema from './user.schema';
import productSwaggerSchema from './product.schema';
import cartSwaggerSchema from './cart.schema';
import responseSwaggerSchema from './response.schema';
import ordersSwaggerSchema from './orders.schema';

const swaggerSchemas = {
	...userSwaggerSchema,
	...productSwaggerSchema,
	...cartSwaggerSchema,
	...responseSwaggerSchema,
	...ordersSwaggerSchema
};

export default swaggerSchemas;
