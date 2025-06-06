import catchAsync from '../utils/catchAsync.js';
import models from '../db/models/index.js';
import commonValidators from '../validators/commonValidators.js';
import AppError from '../utils/appError.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contact_us = catchAsync(async (req, res, next) => {
    const contactUsValidation = commonValidators.validate_required_keys(req.body, ['email', 'phone', 'address', 'description']);
    if (!contactUsValidation.isValid)
        throw new AppError(contactUsValidation.message, 400);

    const emailValidation = commonValidators.validateEmail(req.body.email);
        if (!emailValidation.isValid)
            throw new AppError(emailValidation.error, 400);

    await models.contact_us.create(req.body);
    return res.status(200).json({
        status: 'success',
        message: 'Your message has been received'
    });
});

const submit_complain = catchAsync(async (req, res, next) => {
    const complainValidation = commonValidators.validate_required_keys(req.body, ['email', 'phone', 'name', 'message']);
    if (!complainValidation.isValid)
        throw new AppError(complainValidation.message, 400);

    const emailValidation = commonValidators.validateEmail(req.body.email);
        if (!emailValidation.isValid)
            throw new AppError(emailValidation.error, 400);

    await models.complain.create(req.body);
    return res.status(200).json({
        status: 'success',
        message: 'Complain added successfully'
    });
});

const certificates = catchAsync(async (req, res, next) => {
    const certificates_data = await models.certificate.findAll({
        where: {
            is_enabled: true
        }
    });

    const certificates_with_base64 = await Promise.all(certificates_data.map(async (certificate) => {
        const certificateObj = certificate.toJSON();
        if (certificateObj.image_url) {
            try {
                const imagePath = path.join(__dirname, '..', certificateObj.image_url);
                const imageBuffer = fs.readFileSync(imagePath);
                certificateObj.image_base64 = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
            } catch (error) {
                console.error(`Error reading image for certificate ${certificateObj.id}:`, error);
                certificateObj.image_base64 = null;
            }
        }
        return certificateObj;
    }));

    return res.status(200).json({
        status: 'success',
        data: certificates_with_base64
    });
});

const subscribe_newsletter = catchAsync(async (req, res, next) => {
    const newsletterValidation = commonValidators.validate_required_keys(req.body, ['email']);
    if (!newsletterValidation.isValid)
        throw new AppError(newsletterValidation.message, 400);

    const emailValidation = commonValidators.validateEmail(req.body.email);
    if (!emailValidation.isValid)
        throw new AppError(emailValidation.error, 400);

    const existingSubscription = await models.newsletter.findOne({
        where: {
            email: req.body.email
        }
    });

    if (existingSubscription)
        throw new AppError('You have already subscribed to NewsLetter', 400);

    await models.newsletter.create({
        email: req.body.email
    });

    return res.status(200).json({
        status: 'success',
        message: 'Successfully subscribed to NewsLetter'
    });
});

const blogs = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: blogs_data } = await models.blogs.findAndCountAll({
        where: {
            is_published: true
        },
        order: [['created_at', 'DESC']],
        limit,
        offset
    });

    const blogs_with_base64 = await Promise.all(blogs_data.map(async (blog) => {
        const blogObj = blog.toJSON();
        if (blogObj.image_url) {
            try {
                const imagePath = path.join(__dirname, '..', blogObj.image_url);
                const imageBuffer = fs.readFileSync(imagePath);
                blogObj.image_base64 = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
            } catch (error) {
                console.error(`Error reading image for blog ${blogObj.id}:`, error);
                blogObj.image_base64 = null;
            }
        }
        return blogObj;
    }));

    return res.status(200).json({
        status: 'success',
        data: {
            total: count,
            page,
            limit,
            blogs: blogs_with_base64
        }
    });
});

const get_blog = catchAsync(async (req, res, next) => {
    const blog_id = req.params.blog_id;
    
    const blog = await models.blogs.findOne({
        where: {
            id: blog_id,
            is_published: true
        },
        include: [{
            model: models.blog_comments,
            as: 'comments',
            attributes: ['id', 'name', 'email', 'comment', 'created_at']
        }]
    });

    if (!blog) {
        throw new AppError('Blog not found', 404);
    }

    const blogObj = blog.toJSON();
    if (blogObj.image_url) {
        try {
            const imagePath = path.join(__dirname, '..', blogObj.image_url);
            const imageBuffer = fs.readFileSync(imagePath);
            blogObj.image_base64 = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
        } catch (error) {
            console.error(`Error reading image for blog ${blogObj.id}:`, error);
            blogObj.image_base64 = null;
        }
    }

    return res.status(200).json({
        status: 'success',
        data: blogObj
    });
});

const submit_blog_comment = catchAsync(async (req, res, next) => {
    const blogValidation = commonValidators.validate_required_keys(req.body, ['email', 'name', 'comment', 'blog_id']);
    if (!blogValidation.isValid)
        throw new AppError(blogValidation.message, 400);

    const emailValidation = commonValidators.validateEmail(req.body.email);
        if (!emailValidation.isValid)
            throw new AppError(emailValidation.error, 400);
    
    const blog = await models.blogs.findOne({
        where: {
            id: req.body.blog_id,
            is_published: true
        }
    });

    if (!blog) {
        throw new AppError('Blog not found', 404);
    }

    await models.blog_comments.create(req.body);
    return res.status(200).json({
        status: 'success',
        message: 'Comment added successfully'
    });
});

export default {
    contact_us,
    submit_complain,
    certificates,
    subscribe_newsletter,
    blogs,
    get_blog,
    submit_blog_comment
};
