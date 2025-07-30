import { Router } from 'express';
import { SettingController } from '../controllers';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { settingValidator } from '../validators';
import { container } from '../config/container';
import { TYPES } from '../config/types';

const router = Router();
const settingController = container.get<SettingController>(TYPES.SettingController);

router.use(isAuthenticated);

// TODO: Add isAuthorized middleware

// Get all settings (admin only)
router.get('/', settingController.getAllSettings.bind(settingController));

// Get a specific setting by key
router.get('/:key', settingController.getSettingByKey.bind(settingController));

// Create or update a setting (admin only)
router.post(
	'/',
	validateRequest({ body: settingValidator.upsertSetting }),
	settingController.upsertSetting.bind(settingController)
);

// Delete a setting (admin only)
router.delete('/:key', settingController.deleteSetting.bind(settingController));


export default router;
