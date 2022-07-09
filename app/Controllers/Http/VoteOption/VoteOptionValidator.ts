import { schema} from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
export default class VoteOptionValidator{
    async validateVoteOptionSchema(ctx : HttpContextContract){
      const createReportSchema = schema.create({
        option_id: schema.number(),
        poll_id: schema.number()
      })
      const msg =  {
        'option_id.required': 'Option is requird',
        'poll_id.required': 'Poll is requird',
      }
      return await ctx.request.validate({ schema: createReportSchema, messages : msg })

    }
}
