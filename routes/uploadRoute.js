import uploadController from '../controllers/uploadController.js';
import middlewares from '../middlewares.js';
import express from 'express';

const router = express.Router();

router.route('/id-picture').post(await middlewares.verify_client_http_token('USER'), uploadController.upload_id_picture);
router.route('/profile-picture').post(await middlewares.verify_client_http_token('USER'), uploadController.upload_profile_picture);
router.route('/university-id-picture').post(await middlewares.verify_client_http_token('USER'), uploadController.upload_university_id_picture);
router.route('/asset-picture/:ride_id').post(await middlewares.verify_client_http_token('USER'), uploadController.upload_asset_picture);
router.route('/certificate-picture/:certificate_id').post(await middlewares.verify_admin_http_token(), uploadController.upload_certificate_picture);
router.route('/blog-picture/:blog_id').post(await middlewares.verify_admin_http_token(), uploadController.upload_blog_picture);
router.route('/payment-method-logo/:payment_method_id').post(await middlewares.verify_admin_http_token(), uploadController.upload_payment_method_picture);
export default { router };