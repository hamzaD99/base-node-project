import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import storages from '../utils/storages.js';
import models from '../db/models/index.js';
import commonValidators from '../validators/commonValidators.js';


const uploadUserDocument = (uploadFunction, filePathKey, folderName, isReuploadable = false) => catchAsync(async (req, res, next) => {

    if (!isReuploadable) {
        const user = await models.users.findByPk(req.user.id);
        if (user[filePathKey]) {
            if (user.status !== 'REJECTED') {
                return next(new AppError('You cannot re-upload the document', 400));
            }
            const unresolvedRejections = await models.user_rejections.findAll({
                where: {
                    user_id: req.user.id,
                    is_resolved: false,
                    rejection_type: filePathKey
                }
            });
            if (!unresolvedRejections.length) {
                return next(new AppError('You cannot re-upload the document', 400));
            }
        }
    }

    await uploadFunction(req, res, async (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                const maxFileSize = await models.metadata.findByPk('MAX_FILE_SIZE');
                return next(new AppError(`File size too large. Maximum size is ${maxFileSize.value} MB`, 400));
            }
            return next(new AppError(err.message || 'Error uploading file', 400));
        }

        if (!req.file) {
            return next(new AppError('Please upload a file', 400));
        }

        const user = await models.users.findByPk(req.user.id);

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        user[filePathKey] = `/mock_assets/${folderName}/${req.file.filename}`;
        user.updated_at = new Date();
        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Document uploaded successfully',
            data: {
                [filePathKey]: user[filePathKey]
            }
        });
    });
});

const uploadAssetPicture = (uploadFunction, folderName) => catchAsync(async (req, res, next) => {
    const rideValidation = commonValidators.validate_required_keys(req.params, ['ride_id']);
    if (!rideValidation.isValid)
        throw new AppError(rideValidation.message, 400);

    const ride = await models.rides.findByPk(req.params.ride_id);
    
    if (!ride)
        return next(new AppError('Ride not found', 404));
    if (ride.user_id !== req.user.id)
        return next(new AppError('You are not the owner of this ride', 400));

    const canUpload = ride.status === 'IN-PROGRESS' || (ride.status === 'COMPLETED' && ride.end_mode !== 'NORMAL');
    
    if (!canUpload)
        return next(new AppError('Ride is not in progress', 400));
    
    await uploadFunction(req, res, async (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                const maxFileSize = await models.metadata.findByPk('MAX_FILE_SIZE');
                return next(new AppError(`File size too large. Maximum size is ${maxFileSize.value} MB`, 400));
            }
            return next(new AppError(err.message || 'Error uploading file', 400));
        }

        if (!req.file) {
            return next(new AppError('Please upload a file', 400));
        }


        ride['end_ride_asset_photo'] = `/mock_assets/${folderName}/${req.file.filename}`;
        ride.updated_at = new Date();
        await ride.save();

        res.status(200).json({
            status: 'success',
            message: 'Asset picture uploaded successfully',
            data: {
                asset_picture: ride['end_ride_asset_photo']
            }
        });
    });
});

const uploadWebsiteCertificate = (uploadFunction, folderName) => catchAsync(async (req, res, next) => {
    const certificateValidation = commonValidators.validate_required_keys(req.params, ['certificate_id']);
    if (!certificateValidation.isValid)
        throw new AppError(certificateValidation.message, 400);

    const certificate = await models.certificate.findByPk(req.params.certificate_id);
    
    if (!certificate)
        return next(new AppError('Certificate not found', 404));
    
    await uploadFunction(req, res, async (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                const maxFileSize = await models.metadata.findByPk('MAX_FILE_SIZE');
                return next(new AppError(`File size too large. Maximum size is ${maxFileSize.value} MB`, 400));
            }
            return next(new AppError(err.message || 'Error uploading file', 400));
        }

        if (!req.file) {
            return next(new AppError('Please upload a file', 400));
        }


        certificate['image_url'] = `/mock_assets/${folderName}/${req.file.filename}`;
        await certificate.save();

        res.status(200).json({
            status: 'success',
            message: 'Certificate picture uploaded successfully',
            data: {
                image_url: certificate['image_url']
            }
        });
    });
});

const uploadBlogPicture = (uploadFunction, folderName) => catchAsync(async (req, res, next) => {
    const blogValidation = commonValidators.validate_required_keys(req.params, ['blog_id']);
    if (!blogValidation.isValid)
        throw new AppError(blogValidation.message, 400);

    const blog = await models.blogs.findByPk(req.params.blog_id);
    
    if (!blog)
        return next(new AppError('Blog not found', 404));
    
    await uploadFunction(req, res, async (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                const maxFileSize = await models.metadata.findByPk('MAX_FILE_SIZE');
                return next(new AppError(`File size too large. Maximum size is ${maxFileSize.value} MB`, 400));
            }
            return next(new AppError(err.message || 'Error uploading file', 400));
        }

        if (!req.file) {
            return next(new AppError('Please upload a file', 400));
        }


        blog['image_url'] = `/mock_assets/${folderName}/${req.file.filename}`;
        await blog.save();

        res.status(200).json({
            status: 'success',
            message: 'Blog picture uploaded successfully',
            data: {
                image_url: blog['image_url']
            }
        });
    });
});

const uploadPaymentMethodPicture = (uploadFunction, folderName) => catchAsync(async (req, res, next) => {
    const validation = commonValidators.validate_required_keys(req.params, ['payment_method_id']);
    if (!validation.isValid)
        throw new AppError(validation.message, 400);

    const payment_method = await models.payment_methods.findByPk(req.params.payment_method_id);
    
    if (!payment_method)
        return next(new AppError('Payment method not found', 404));
    
    await uploadFunction(req, res, async (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                const maxFileSize = await models.metadata.findByPk('MAX_FILE_SIZE');
                return next(new AppError(`File size too large. Maximum size is ${maxFileSize.value} MB`, 400));
            }
            return next(new AppError(err.message || 'Error uploading file', 400));
        }

        if (!req.file) {
            return next(new AppError('Please upload a file', 400));
        }


        payment_method['logo'] = `/${folderName}/${req.file.filename}`;
        await payment_method.save();

        res.status(200).json({
            status: 'success',
            message: 'Payment method logo uploaded successfully',
            data: {
                logo_url: payment_method['logo']
            }
        });
    });
});

const upload_id_picture = uploadUserDocument(storages.upload_id_picture, 'id_picture', 'id_pictures');

const upload_university_id_picture = uploadUserDocument(storages.upload_university_id_picture, 'university_id_picture', 'university_id_pictures');

const upload_profile_picture = uploadUserDocument(storages.upload_profile_picture, 'profile_picture', 'profile_pictures', true);

const upload_asset_picture = uploadAssetPicture(storages.upload_asset_picture, 'asset_pictures');

const upload_certificate_picture = uploadWebsiteCertificate(storages.upload_certificate_picture, 'website_certificates');

const upload_blog_picture = uploadBlogPicture(storages.upload_blog_picture, 'website_blog_photos');

const upload_payment_method_picture = uploadPaymentMethodPicture(storages.upload_payment_method_picture, 'public_assets');


export default {
    upload_id_picture,
    upload_university_id_picture,
    upload_profile_picture,
    upload_asset_picture,
    upload_certificate_picture,
    upload_blog_picture,
    upload_payment_method_picture
};