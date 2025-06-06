import websiteController from '../controllers/websiteController.js';
import express from 'express';
import multer from 'multer';
import middlewares from '../middlewares.js';

const upload = multer();
const router = express.Router();

// Apply form submission limiter to contact and complaint forms
router.post('/contact-us', middlewares.rateLimiter, upload.none(), websiteController.contact_us);
router.post('/complain', middlewares.rateLimiter, upload.none(), websiteController.submit_complain);

// Apply general limiter to other endpoints
router.get('/certificates', middlewares.rateLimiter, websiteController.certificates);
router.post('/subscribe-newsletter', middlewares.rateLimiter, upload.none(), websiteController.subscribe_newsletter);
router.get('/blogs', middlewares.rateLimiter, websiteController.blogs);
router.get('/blog/:blog_id', middlewares.rateLimiter, websiteController.get_blog);
router.post('/blog-comment', middlewares.rateLimiter, websiteController.submit_blog_comment);

export default { router };