import { schema,rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
export default class AuthValidator{
    public async validateSignupSchema(ctx : HttpContextContract){
      const userSchema = schema.create({
        email: schema.string({}, [
          rules.email({
            ignoreMaxLength: false,
            //domainSpecificValidation: true,
          }),
          rules.unique({ table: 'users', column: 'email' }),
        ]),
        first_name : schema.string({
          escape: true,
          trim: true
        }),
        // birth_date : schema.string({
        //   escape: true,
        //   trim: true
        // }),
        last_name : schema.string({
          escape: true,
          trim: true
        }),
        // gender : schema.string({
        //   escape: true,
        //   trim: true
        // }),
        password: schema.string({escape: true,
          trim: true}, [
            rules.minLength(6),
            rules.confirmed()
        ]),
      })
      const msg =  {
        'email.required': 'Email is required',
        'email.unique': 'Email is already in use',
        'email.email': 'Invalid email address',
        'first_name.required': 'Firstname is required',
        'last_name.required': 'Lastname is required',
        'password.required': 'Password is required',
        'password.minLength': 'Password must be at least 6 charecters long',
        'password_confirmation.confirmed': "Password and confirm password doesn't match",
        // 'gender.required': "Gender is required",
      }
      return await ctx.request.validate({ schema: userSchema, messages : msg })
      // try {
      //   const payload = await ctx.request.validate({ schema: userSchema, messages : msg })
      //   return payload
      // } catch (error) {
      //    return ctx.response.status(422).send(error.messages)
      // }



    }
    public async validateLoginSchema(ctx : HttpContextContract){
      const userSchema = schema.create({
        email: schema.string({trim: true}, [
          rules.email(),
        ]),
        password: schema.string({trim: true,}),
      })
      const msg =  {
        'email.required': 'Email is required',
         'email.email': 'Email validation failed',
        'email.exists': 'Invalid email!',
        'password.required': 'Password is required',

      }
      return await ctx.request.validate({ schema: userSchema, messages : msg })

    }
   public async validateFacebookLink(ctx : HttpContextContract){
      const userSchema = schema.create({
        facebookHandle: schema.string({}, [
        rules.url({
          allowedHosts:['www.facebook.com'],
          protocols: ['http', 'https'],
          requireProtocol: true,
          })
      ])
    })
    const msg =  {
      'facebookHandle.url': 'Invalid url'
    }
    return await ctx.request.validate({ schema: userSchema, messages : msg })
   }
    public async validateResetSchema(ctx : HttpContextContract){
      const userSchema = schema.create({
        email: schema.string({trim: true}, [
          rules.email(),
        ]),


      })
      const msg =  {
        'email.required': 'Email is required',
      }
      return await ctx.request.validate({ schema: userSchema, messages : msg })
    }

    public async validateTokenData(ctx : HttpContextContract){
      const userSchema = schema.create({
        verificationCode: schema.string({trim: true}, [
          rules.minLength(6)
        ]),
        email: schema.string({trim: true}, [
          rules.email(),

        ]),


      })
      const msg =  {
        'verificationCode.required': 'Token is required',
        'verificationCode.minLength': 'Token must not less than 6 charecters!',
      }
      return await ctx.request.validate({ schema: userSchema, messages : msg })
    }

    public async validateNewPasswordData(ctx){
      const userSchema = schema.create({
         password: schema.string({ trim: true }, [
          rules.minLength(6)
        ]),
         email: schema.string({ trim: true }, [
          rules.email(),
           rules.exists({ table: 'users', column: 'email' })
        ]),
        })
      const msg = {
        required: 'The {{field}} is required',
        'email.exists': 'invalid credentials',
        'email.minLength': 'Token must not less than 6 charecters!',
      }
      return await ctx.request.validate({ schema: userSchema, messages : msg })
    }


    async validateVerificationData(ctx) {

      const limitUserSchema = schema.create({
        verificationCode: schema.string({ trim: true }),
        email: schema.string({ trim: true }),
      })
      const messages = {
        required: 'The {{field}} is required',
      }

     return ctx.request.validate({ schema: limitUserSchema, messages: messages })

    }

}
