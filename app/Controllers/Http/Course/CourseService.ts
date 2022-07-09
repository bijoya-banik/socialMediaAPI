import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CourseQuery from './CourseQuery';
import CustomHelpers from 'App/Helpers/CustomHelpers';
import Stripe from 'stripe'
import Env from '@ioc:Adonis/Core/Env'
const axios = require('axios');
const moment = require('moment')
const GoogleAppId =Env.get('GOOGLE_APP_ID')

// import validator and private key
const GoogleReceiptVerify = require('google-play-billing-validator')

// instantiate google receipt verify
const googleReceiptVerify = new GoogleReceiptVerify({
  email: Env.get('GOOGLE_SERVICE_CLIENT_EMAIL'),
  key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCwQ7RkUxCWqmPR\ndAMJVde9qKpYASg/BiGfTDHQR8suktuQS1cSrC0YlJs+v/DCIAiB5dxhtzYwVBJ2\nJ5fTJsb6tGmEkPb01FLvZ+t6+5ydMIxHFVYTuEWU4Q16IgBDPEW25eskiO/rQ3c3\n1/HF2KK+G1jf0TQQ86onD6Op9d0eoQVMWn2m7DB0Jt8ySpPSTFkRV4BKgewF4opY\n0PJsNuhHVelCBzrjxA9F76Y/k40wfq4YIlin4JLz0lzxJBCF2xJbfVqLEf2jXiDq\nsptjHz8zjGNI5xNx5wLaZ8RxOukF4jCZjEHYs57XWoM3+nOUCnW10epxZDQXOqJ8\nxEWOSvYdAgMBAAECggEABTstKmEQt/f8mGXCBU/n5DgSPiRipmQvMUQYol7PF+XB\n4Glr/yDfAcC/TsBxi8FZn0lMHhZK5GpKVflc1yZqd1xNWWLYAXIft/00juTSxBOB\nxkZK1LD+V6nKNZq2uUgbpY7zSJVL0YaiDiU5hq6kPdIf9ByIWAxzO0+KguvKETOX\nj3sBZ2iNvKbUxlmVmqncjPqZskDKEUw9peWFI+upH9DxvHR8Q3bfIW4pE5RzURL3\n7BfUs2/UPtKhSf/kWIAxCxIocLieeD4WcfcD1SIJu9gynz0N3v18UltBAIXj0gi4\nhpwILK7mQiYQ/quPLKm7P5iT1+j8UHC/qkS/6FGdYQKBgQDcq6Tgvmn1ABcssPAR\nwvWrfqFSsSg8AIhIG+7Q0iIwY0geoJ7JkgzOOOfZPAf4b/FQ9kMnXzg7aVgu8mjI\n/tfk6nJqDNMODvGUjpw4nBCZZC3D4gBZ/HEypU6KDC5L5IzVycwm/6x1PG/GJCCX\nzzQTibH1MrSTxtuKuTkFaq9N5QKBgQDMfAtxrru7GOfkXYF5NXJr6ntjDkvTSJHP\nLyw6a4OJPBkrcy4sGAx3G1a0sssJCOfJcnSbmOAwwkzjSK2Lp5VV0HC+43QVxIX9\n8MHH+Tim4OJP+luWkuViuIK9YrHASFpqCTHaQpO9aFURevfBrdD/rYedyQpqB9c/\nYQm2uCND2QKBgDF5FfUBG7Y+9/MgFCKXSAbT1A07BJ83K1anVIpioiGhEJk1P4RH\nhzFw1qIAcHUFe9+/5lxcX7oKKygTVuTBJdv/p/kYuPSs6wJ4WpPigWIycIQ7FgMW\nsrY9E3eltXd0XRLNNEUGCz8ZdqHAlcITRUSgGVK0tIFxEuVuE1egjH71AoGAc3hY\nvgl92VlnGX3z7w5PXsE6i+U2zEjejbCFuTedP5HAZNjV6fBqmZfGjqOoI6Hzwb3w\nOy1I7D/MS0xvM72ehqb+A81NcD1ZrNyXkOUbKKE1KxSlQ5IQFn861Nc2qO4yoE4w\n6J9P7lVMNGLMJYKR0s+bFW7Bgr6Kvi993MB+qYECgYBoV5KLoRT466WC8WKAf2oW\n1M0cYEZHa+YWnyxV/gEXPujFpUmGpndoV60mFgif0UQMVy3OmFq8MGUX9BdgmR/5\nDxemmpjsi3DcprEBCUSeYt27U57+xS37AGSKA26/QnApzfmRWxvvA0+DQDEQJsMy\nmy9YEtpsR0kIHkF1JCT/pg==\n-----END PRIVATE KEY-----\n",

  // key: Env.get('GOOGLE_SERVICE_PRIVATE_KEY')
});


export default class CourseService {
    private courseQuery : CourseQuery

    private customHelpers : CustomHelpers
    constructor(){
      this.courseQuery = new CourseQuery
      this.customHelpers = new CustomHelpers

    }
    public async getAllCourseType(ctx : HttpContextContract){

      let trainings = await this.courseQuery.getCourseByType('training',6)
      let webinars = await this.courseQuery.getCourseByType('Webinar',6)


      if (trainings.length > 0) {
          for (let d of trainings) {
            let details = JSON.parse(d.data);
            details.totalContents = details.contents.length
            details.contents = [];
            if(details.cover && details.cover.source  ) details.cover.source = this.customHelpers.getImage(details.cover.source )
            d.data = details;
            // if(d.user && d.user.profile_pic ){ d.user.profile_pic = this.customHelpers.getImage( d.user.profile_pic )}
          }
      }
      if (webinars.length > 0) {
          for (let d of webinars) {
            let details = JSON.parse(d.data);
            details.totalContents = details.contents.length
            details.contents = [];
            details.course_price  = 12.99;
            if(details.cover && details.cover.source  ) details.cover.source = this.customHelpers.getImage(details.cover.source )
            // if(d.user && d.user.profile_pic ){ d.user.profile_pic = this.customHelpers.getImage( d.user.profile_pic ) }

            d.data = details;
          }
      }

      let nrc_courses = await this.courseQuery.getNrcCourse(6)
      let pre_licensing = await this.courseQuery.getPreLicensingCourse(6)

      if(nrc_courses.length > 0){
        for (let d of nrc_courses) {
          if(d.cover) d.cover = this.customHelpers.getImage( d.cover )
        }
      }
      if(pre_licensing.length > 0){
        for (let d of pre_licensing) {
          if(d.cover) d.cover = this.customHelpers.getImage( d.cover )
        }
      }


      return ctx.response.status(200).json({
          courses: trainings,
          webinars: webinars,
          nrc_courses: nrc_courses,
          pre_licensing: pre_licensing,
          // nrc_courses: [],
          // pre_licensing: [],
      })
    }
    public async getAllCourseTypeCount(ctx : HttpContextContract){

      let trainings:any = await this.courseQuery.getCourseByTypeCount('Training')
      // let a = JSON.parse(JSON.stringify(trainings[0]))


      let webinars:any = await this.courseQuery.getCourseByTypeCount('Webinar')
      let nrc_courses:any = await this.courseQuery.getNrcCourseCount()
      let pre_licensing:any = await this.courseQuery.getPreLicensingCourseCount()
      let members:any = await this.courseQuery.getTotalMembershipHolder()
      trainings =  trainings[0].toJSON()
      webinars =  webinars[0].toJSON()
      nrc_courses =  nrc_courses[0].toJSON()
      pre_licensing =  pre_licensing[0].toJSON()
      members =  members[0].toJSON()


      return ctx.response.status(200).json({
          coursesCount:  trainings && trainings.meta && trainings.meta.total ? trainings.meta.total: 0 ,
          webinarsCount: webinars && webinars.meta  && webinars.meta.total ?  webinars.meta.total : 0,
          members: members && members.meta && members.meta.total ?  members.meta.total : 0,
          // nrc_coursesCount:  nrc_courses && nrc_courses.meta && nrc_courses.meta.total ?  nrc_courses.meta.total : 0,
          // pre_licensingCount:  pre_licensing && pre_licensing.meta && pre_licensing.meta.total ?  pre_licensing.meta.total : 0,
          nrc_coursesCount: 0,
          pre_licensingCount: 0,
      })
    }
    public async getCourseByType(ctx : HttpContextContract){
      const type = ctx.params.type
      const limit = ctx.request.all().limit? ctx.request.all().limit : 6
      if(type == 'Webinar' || type == 'training'){

        let courses = await this.courseQuery.getCourseByType(type,limit)
        if(!courses.length) return courses;
        for(let d of courses ){

          let details = JSON.parse(d.data);
          details.totalContents = details.contents.length

          details.contents = [];
          if(d.activity_type == 'Webinar') details.course_price  = 12.99;
          d.data = details;
         }
        return courses
      }

      else if(type == 'NrcCourse'){
        let courses = await this.courseQuery.getNrcCourse(limit)
        return courses
      }
      else if(type == 'PreLicensingCourse'){
        let courses = await this.courseQuery.getPreLicensingCourse(limit)
        return courses
      }
      else {
        return [];
      }

    }
    public async getMyCourseByType(ctx : HttpContextContract){
      const type = ctx.params.type
      const limit = ctx.request.all().limit? ctx.request.all().limit : 6



        let user:any = {
          id:0
        }
        try {
          user =  await ctx.auth.use('web').authenticate();
        } catch (error) {
          // console.log("Erorro",error)
        }

        let courses:any = [];

        if(type == 'Webinar' && user.id !=0 && user.course_status && user.course_status == 'Member'){
           courses = await this.courseQuery.getCourseByType(type,limit)
        }
        else {

          courses = await this.courseQuery.getMyCourseByType(type,limit,user.id)
        }





        if(!courses.length) return courses;
        for(let d of courses ){

          let details = JSON.parse(d.data);
          details.totalContents = details.contents.length

          details.contents = [];
          if(d.activity_type == 'Webinar') details.course_price  = 12.99;
          if(details.cover && details.cover.source )  details.cover.source = this.customHelpers.getImage(details.cover.source)
          d.data = details;
        }
        return courses


    }
    async getCourseDetailsById (ctx : HttpContextContract){
      let user = {
        id:0
      }
      try {
        user =  await ctx.auth.use('web').authenticate();
      } catch (error) {
        // console.log("Erorro",error)
      }
      const id = ctx.params.id
      // return ctx.params.id
      var course:any = await this.courseQuery.getCourseDetailsById(id,user.id)
       this.courseQuery.increaseCourseView(id)

      if(!course) return course;
      course = JSON.parse(JSON.stringify(course))
      let isSubscription = false

      if (course.isSubscriber) {
        isSubscription = true;
        let isSubscriber = course.isSubscriber;
        let date_now = moment().format("YYYY-MM-DD")
        let course_expired_at = moment(isSubscriber.expired_at).format("YYYY-MM-DD")
        if(course_expired_at < date_now){
          isSubscription = false;
            // console.log("Course Expired!")
            this.courseQuery.updateCourseSubscribers(isSubscriber.id,{isActive:0})
            // data.isSubscriber = null
            // isSubscriber = null
        }
      }
      let details = JSON.parse(course.data);
      if(details.cover &&  details.cover.source) details.cover.source = this.customHelpers.getImage(details.cover.source)


      details.totalContents = details.contents.length
      details.isSubscription = isSubscription;
      // details.contents = [];
      course.data = details;
      // console.log('course------------------')
      // console.log(course)
      if(course.activity_type=='Webinar'){
        let date_now = moment().format("YYYY-MM-DD")
        let start_date_time = moment(course.start_date_time).format("YYYY-MM-DD")
        if(date_now >= start_date_time){
          course.meta.isPublished = "Yes"
        }
        else  course.meta.isPublished = "No"
      }


      return course;
    }
    async getCourseDetailsByAppId (ctx : HttpContextContract){
      let user:any = {
        id:0
      }
      try {
        user =  await ctx.auth.use('api').authenticate();
      } catch (error) {
        // console.log("Erorro",error)
      }
      const id = ctx.params.id
      // return ctx.params.id
      var course:any  = await this.courseQuery.getCourseDetailsById(id,user.id)
       this.courseQuery.increaseCourseView(id)

      if(!course) return course;
      course = JSON.parse(JSON.stringify(course))
      let isSubscription = false

      if (course.isSubscriber) {
        isSubscription = true;
        let isSubscriber = course.isSubscriber;
        let date_now = moment().format("YYYY-MM-DD")
        let course_expired_at = moment(isSubscriber.expired_at).format("YYYY-MM-DD")
        if(course_expired_at < date_now){
          isSubscription = false;
            // console.log("Course Expired!")
            this.courseQuery.updateCourseSubscribers(isSubscriber.id,{isActive:0})
            // data.isSubscriber = null
            // isSubscriber = null
        }
      }
      if(user && user.id !=0 && user.course_status == 'Member' &&  course.activity_type == 'Webinar') isSubscription = true
      let details = JSON.parse(course.data);
      details.totalContents = details.contents.length
      details.isSubscription = isSubscription;
      if(isSubscription == false && details.course_price > 0) {
        for(let d of details.contents){
          delete d.source;
        }
      }
      else {
        if(course.activity_type == 'Webinar'){

            for(let d of details.contents){
              d.title = course.activity_text
            }
        }
      }
      if(course.activity_type == 'Webinar') details.course_price  = 12.99;
      course.data = details;

      if(course.activity_type=='Webinar'){
        let date_now = moment().format("YYYY-MM-DD")
        let start_date_time = moment(course.start_date_time).format("YYYY-MM-DD")
        if(date_now >= start_date_time){
          course.meta.isPublished = "Yes"
        }
        else  course.meta.isPublished = "No"
      }


      return course;
    }
    async getCourseContentsById (ctx : HttpContextContract){
      let user = {
        id:0,
        course_status:'General'
      }
      try {
        user =  await ctx.auth.use('web').authenticate();
      } catch (error) {
        // console.log("Erorro",error)
      }
      const id = ctx.params.id
      // return ctx.params.id
      let course = await this.courseQuery.getCourseDetailsById(id,user.id)
       this.courseQuery.increaseCourseView(id)

      if(!course) return course;
      let isSubscription = false


    if (user.course_status != 'Member' && course.subscribers == null) {
        return ctx.response.status(401).json({
            msg: "You are not subscribe to this webinar"
        })
    }

      if (course.isSubscriber) {
        isSubscription = true;
        let isSubscriber = course.isSubscriber;
        let date_now = moment().format("YYYY-MM-DD")
        let course_expired_at = moment(isSubscriber.expired_at).format("YYYY-MM-DD")
        if(course_expired_at < date_now){
          isSubscription = false;
            // console.log("Course Expired!")
            this.courseQuery.updateCourseSubscribers(isSubscriber.id,{isActive:0})
            // data.isSubscriber = null
            // isSubscriber = null
        }
      }
      let details = JSON.parse(course.data);

      details.totalContents = details.contents.length
      details.isSubscription = isSubscription;

      course.data = details;


      return course;
    }

    async subscription(ctx : HttpContextContract){
      return this.courseQuery.subscription(ctx);
    }

    async coursePaymentWeb (ctx : HttpContextContract){
      let user:any = ctx.auth.user
      let data_request = ctx.request.all()
      if (!data_request.course_id || !data_request.token || !data_request.type ) {
          return ctx.response.status(401).json({
              message: 'Invalid request!'
          })
      }
      let key:any = process.env.STRIPE_SECRET_kEY;
      if(!key){
        return ctx.response.status(401).json({
          msg: 'something went wrong!1'
        })
      }
      const stripe = new Stripe( key, {
        apiVersion: '2020-08-27'
      });

      let course:any =  this.courseQuery.getCourseDetailsById(data_request.course_id,user.id)
      if(course == null){
        return ctx.response.status(401).json({
          msg: 'something went wrong!2'
        })
      }
      // course = course.toJSON();
      // course.data = JSON.parse(course.data);
      let price = data_request.price;

      // if(data_request.couponStatus){
      //   price = price -  ((course.data.course_price * data_request.couponItem.amount)/100)

      // }
      let description = `${data_request.type == 1? 'Single-'+data_request.course_id : 'Multiple'} Webinar purchased for $${price}`
      let stripe_price  = Math.ceil(price * 100);

      // console.log('purchased-description')
      // console.log(description)


            try {
                 await stripe.charges.create({
                    amount: stripe_price,
                    currency: 'usd',
                    source: data_request.token ,
                    description: description,
                });
                if(data_request.type == 1){

                    let obb = {
                        user_id:user.id,
                        course_id:data_request.course_id,
                        isActive:1,
                        type:data_request.courseType,
                        expired_at:'',
                    };
                    var futureMonth =  moment().add( 1, 'M');
                    obb.expired_at =  moment(futureMonth).format("YYYY-MM-DD");
                    // console.log('-----------------');
                    // console.log(obb);
                    await this.courseQuery.createCourseSubscriber(obb);


                }
                else{
                  var futureMonth =  moment().add( 1, 'Y');
                  var expired_at =  moment(futureMonth).format("YYYY-MM-DD");
                  await this.courseQuery.updateUserCourseMembership(user.id,expired_at);
                }




                let newTransactionData = {
                  user_id: user.id,
                  amount: (data_request.price) * -1,
                  reason: 'Course',
                  ad_id: data_request.course_id,
                  paymentType: data_request.paymentType,
                  payment_id: data_request.transaction_id,
                }
                await this.customHelpers.createUserTransaction(newTransactionData);

                // if(data_request.couponStatus){

                //     if(data_request.couponItem.type == 1){
                //         await CourseCoupon.query().where('id',data_request.couponItem.id).delete();
                //     }

                // }
                let updated_course:any =  await this.courseQuery.getCourseDetailsById(data_request.course_id,user.id);

                // await Notification.sendCoursePaymentNotification(user, 'Webinar purchased successfully!',course)


                return ctx.response.status(200).json({
                  message: 'Course has been purchased successfully!',
                  success:true,
                  course: updated_course

              })

            } catch (error) {
                // console.log('stripe-error')
                // console.log(error)
                return ctx.response.status(401).json({
                  msg: 'something went wrong!',
                  error: error
                })
            }
      // console.log('coursePaymentWeb',ctx.data_request.all())
    }
    async coursePaymentApp (ctx : HttpContextContract){
      let user:any = {
        id:0
      }
      try {
        user =  await ctx.auth.use('api').authenticate();
      } catch (error) {
        // console.log("Erorro",error)
      }
      // console.log("user")
      // console.log(user)

      let data = ctx.request.all()
      if (user.id != data.user_id) {
        return ctx.response.status(401).json({
            msg: 'You are not authorized!'
        })
      }
      if (!data.course_id || !data.price || !data.paymentType || !data.transaction_id) {
          return ctx.response.status(401).json({
              msg: 'Invalid request!'
          })
      }


      if(data.paymentType == 'Apple Pay'){
        let checkReceipt = await this.applePayValidation(data.receipt)
        if(checkReceipt.success == false){
            return ctx.response.status(401).json({
                message: 'Receipt validation failed!',
                data:checkReceipt
            })
        }
      }
      else if(data.paymentType == 'Google Pay'){
        // console.log("google pay")
        // return await this.googlePayValidation(data.receipt)
        let checkReceipt = await this.googlePayValidation(data.course_id,data.receipt)
        if(checkReceipt.success == false){
            return ctx.response.status(401).json({
                message: 'Receipt validation failed!',
                data:checkReceipt
            })
        }
      }
      let course_data:any =  await this.courseQuery.getCourseDetailsById(data.course_id,user.id);

      if(data.type == 1){
        let obb:any = {
            user_id:user.id,
            course_id:data.course_id,
            isActive:1
        };
        if(data.couponStatus){
            obb.coupon = data.couponItem.name
        }
        let ad_months = course_data.activity_type == 'Webinar'? 1 : 6
        var futureMonth =  moment().add( ad_months, 'M');
        obb.expired_at =  moment(futureMonth).format("YYYY-MM-DD");
        await this.courseQuery.createCourseSubscriber(obb);
      }

      else{
        var futureMonth =  moment().add( 1, 'Y');
        var expired_at =  moment(futureMonth).format("YYYY-MM-DD");
        await this.courseQuery.updateUserCourseMembership(user.id,expired_at);
      }





      let newTransactionData = {
        user_id: user.id,
        amount: (data.price) * -1,
        reason: 'Course',
        ad_id: data.course_id,
        paymentType: data.paymentType,
        payment_id: data.transaction_id,
      }
      await this.customHelpers.createUserTransaction(newTransactionData);

      // await Notification.sendCoursePaymentNotification(user, 'Training Course has been purchased successfully!',course_data)

      let course:any =  await this.courseQuery.getCourseDetailsById(data.course_id,user.id);
      course = JSON.parse(JSON.stringify(course))
      let isSubscription = true;
      let details = JSON.parse(course.data);
      details.totalContents = details.contents.length
      details.isSubscription = isSubscription;

       if(course.activity_type == 'Webinar'){

          for(let d of details.contents){
            d.title = course.activity_text
          }
      }

      if(course.activity_type == 'Webinar') details.course_price  = 12.99;
      course.data = details;

      if(course.activity_type=='Webinar'){
        let date_now = moment().format("YYYY-MM-DD")
        let start_date_time = moment(course.start_date_time).format("YYYY-MM-DD")
        if(date_now >= start_date_time){
          course.meta.isPublished = "Yes"
        }
        else  course.meta.isPublished = "No"
      }


      return ctx.response.status(200).json({
          message: 'Course has been purchased successfully!',
          success:true,
          course: course

      })


    }

    async applePayValidation(recept){
      let data =  await this.productionApplePayValidationUrl(recept)
      // console.log('applePayValidation')
      // console.log(data)

      if(data.status ==  21007){
          // console.log('Inthe Sand box')
          return await this.sandBoxApplePayValidationUrl(recept)
      }
      else return data;
    }
    async productionApplePayValidationUrl(recept){
      const url = 'https://buy.itunes.apple.com/verifyReceipt';
      return await axios.post(url, {
          'receipt-data': recept,
      })
      .then(function (response) {
          return  {
              success:true,
              data:response.data
          }
      })
      .catch(function (error) {
          return {
              success:false,
              data:error
          }
      });
    }
    async sandBoxApplePayValidationUrl(recept){
      const url = 'https://sandbox.itunes.apple.com/verifyReceipt';

      return await axios.post(url, {
          'receipt-data': recept,
      })
      .then(function (response) {
          // res = JSON.parse(JSON.stringify(response))
        return  {
            success:true,
            from:'sandBox',
            data:response.data
        }
      })
      .catch(function (error) {
      // console.log(error);
        return {
            success:false,
            from:'sandBox',
            data:error
        }
      });
    }

    async googlePayValidation (productId, purchaseToken)  {

      try {

        let response = await googleReceiptVerify.verifyINAPP({
          packageName: GoogleAppId,
          productId: productId,
          purchaseToken: purchaseToken,
        });

        if (response.isSuccessful === true) {
          return {
            success:true,
            response:response,
          }
          // insert receipt and products record
          // await Plans.insertPurchaseReceiptRecord({
          //   purchaseToken: purchaseToken,
          //   verified: true,
          //   products: response['payload']
          // });

          // // convert the returned expiry timestamp from milliseconds to seconds
          // let expirationUnix = Math.round(response['payload'].expiryTimeMillis / 1000);

          // // further processing.
          // let result = await Subscriptions.processSuccessfulSubscription(productId, expirationUnix);

          // // log final processing result
          // console.log(result);

        } else {
          // error: validation not successful
          console.log('response.errorMessage');
          console.log(response.errorMessage);
          return {
            success:false,
            response:response,
          }
        }

      } catch (error) {

        console.log('response.errorMessage');
        console.log(error);
          return {
            success:false,
            response:'response',
          }

      }



    }




};
