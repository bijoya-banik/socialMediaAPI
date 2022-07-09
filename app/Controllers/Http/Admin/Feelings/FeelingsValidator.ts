import { schema,rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
export default class FeelingsValidator{

    public async validateLoginSchema(ctx : HttpContextContract){
      const userSchema = schema.create({
        email: schema.string({trim: true}, [
          rules.email({
            sanitize: true,
          }),
        ]),
        password: schema.string({trim: true,}),
      })
      const msg =  {
        'email.required': 'Email is required',
        'email.email': 'Email validation failed',
        'email.exists': 'Invalid email!',
        'password.required': 'Password is required',
      }
      try {
        const payload = await ctx.request.validate({ schema: userSchema, messages : msg })
        return payload
      } catch (error) {
         return ctx.response.status(422).send(error.messages)
      }



    }
}
