import { schema, rules} from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
export default class PollOptionValidator{
    // public async validatePollOptionSchema(ctx : HttpContextContract){
    //   const limitUserSchema = schema.create({
    //     limit: schema.number(),

    //   })
    //   const msg =  {
    //     'limit.required': 'Limit is required',
    //     'limit.number': 'Limit must be a number'
    //   }
    //   try {
    //     const payload = await ctx.request.validate({ schema: limitUserSchema, messages : msg })
    //     return payload
    //   } catch (error) {
    //      return ctx.response.status(422).send(error.messages)
    //   }



    // }

    async validatePollOptionSchema(ctx : HttpContextContract){
      const createReportSchema = schema.create({
        text: schema.string({escape: true}, [
          rules.maxLength(500)
        ]),
        poll_id: schema.number(),

      })
      const msg =  {
        'text.required': 'Text is required!',
        'text.maxLength': 'You can add maximum of 500 characters',
        'poll_id.required': 'Poll is requird',
      }
      return await ctx.request.validate({ schema: createReportSchema, messages : msg })

    }
}
