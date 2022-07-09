import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import sgMail from '@ioc:Adonis/Addons/Mail';
import BlogQuery from './BlogQuery';
import CustomHelpers from 'App/Helpers/CustomHelpers';
import ContactMessage from 'App/Models/ContactMessage'

export default class BlogService {
    private blogQuery : BlogQuery
    private customHelpers : CustomHelpers

    constructor(){
      this.blogQuery = new BlogQuery
      this.customHelpers = new CustomHelpers

    }
    public async getBlogByLimit(ctx : HttpContextContract){
      const limit = ctx.request.all().limit
      const user = await this.blogQuery.getUserByLimit(limit)
      return user
   }
   public async getBlogCategories(){
      return await this.blogQuery.getBlogCategories()

    }
 public async getPopulerBlogPost(){
    let  status:any = await this.blogQuery.getPopulerBlogPost()


    for (let i of status) {
        if (i.data) {
            i.data = JSON.parse(i.data)
            if(i.data.cover) i.data.cover = this.customHelpers.getImage(i.data.cover)

        }
    }

      return status

  }
  public async recentPosts(ctx){
    let data = ctx.request.all()
    let page = data.page?data.page:1
    let pageSize = data.pageSize?data.pageSize:10
    let  alldata:any = await this.blogQuery.recentPosts(page,pageSize)
    alldata = JSON.parse(JSON.stringify(alldata))
    for (let i of alldata.data) {
        if (i.data) {
            i.data = JSON.parse(i.data)
            if(i.data.cover) i.data.cover = this.customHelpers.getImage(i.data.cover)
            // return i.data
        }
        i.shortDescription = await this.substrWithTags(i.data.html)
    }
    return alldata

  }
  public async recent_blogs(ctx){
    let data = ctx.request.all()
    let more = data.more?data.more:0
     let  alldata:any = await this.blogQuery.recent_blogs(more)
    for (let i of alldata) {
        if (i.data) {
            i.data = JSON.parse(i.data)
        }
        i.shortDescription = await this.substrWithTags(i.data.html)
    }
    return alldata

  }
  public async getSinglePost(ctx){
    let alldata:any =  await this.blogQuery.getSinglePost(ctx.params.id)
    alldata.data = JSON.parse(alldata.data)
    await this.blogQuery.increseViews({id:ctx.params.id,views:alldata.views+1})
    return alldata

  }
  public async emailMsgSend(ctx){
    let is_carevan = process.env.IS_CAREVAN == "yes" ? "Yes" : 'No'
    const data  = ctx.request.all();
        // const msg:any = {
        //     to: 'nazmulchowdhury4@gmail.com',
        //     from: 'contact-message@joincarevan.com',
        //     subject: 'Contact Message',
        //     text: 'Carevan',
        //     html: ` <table border="0" cellpadding="0" cellspacing="0" style="width:100%;height:100%;background-color:#f0f2f4"><tbody><tr><td style="vertical-align:top;background-color:#f0f2f4"><table border="0" cellpadding="0" cellspacing="0" align="center" style="width:600px"><tbody><tr><td style="text-align:center;padding-top:40px;padding-bottom:20px"><a href="http://zoom.us" target="_blank"><img style="width: 200px; height: auto;" src="https://joincarevan.com/logo.png" alt="https://joincarevan.com/logo.png" title="Carevan"></a></td></tr><tr><td style="background-color:#ffffff;padding-bottom:40px"><table border="0" cellpadding="0" cellspacing="0" align="center" style="width:520px"><tbody><tr><td style="padding-top:40px;font-family:helvetica,arial;font-size:14px;line-height:20px;color:#333333"> name : ${data.name}, <br></td></tr><tr><td style="padding-top:12px;font-family:helvetica,arial;font-size:14px;line-height:20px;color:#333333"> Email : ${data.email} <br></td></tr><tr><td style="padding-top:12px;font-family:helvetica,arial;font-size:14px;line-height:20px;color:#333333"> ${data.message} <br></td></tr></tbody></table></td></tr><tr><td style="padding-top:20px;padding-bottom:30px;background-color:#ffffff;border-top-color:#f0f2f4;border-top-style:solid;border-top-width:1px"><table align="center" border="0" cellpadding="0" cellspacing="0" width="100%"><tbody><tr><td style="font-family:helvetica,arial;font-size:12px;line-height:18px;color:#999999;text-align:center;padding-top:10px"> Copyright ©2020 Carevan, Inc. All rights reserved. </td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table>`,
        // };
      if(is_carevan == "Yes"){
        await sgMail.send((message) => {
          message
                .from('contact-message@joincarevan.com','Contact Message' )
                .to('support@joincarevan.com')
                .subject('Contact Message')
                .htmlView('carevan/contact_us_email',  data)
          }).then(() => {
            console.log('Message sent')
        }).catch((error) => {
            console.log('sendgrid error------------------------')
            console.log(error.response.body)
            // console.log(error.response.body.errors[0].message)
        })
        return data;
      }else{
        let  obj = {
          email:data.email,
          message:data.message,
        }
        return ContactMessage.create(obj)

      }

        // let dd = await sgMail.send(msg);


  }


  async substrWithTags(string) {
    var length = 200;
    var openTag = 0, closeTag = 0,i=0;
    for(i; i<length; i++)
    {
        if(string[i] == "<")
            openTag++;
        if(string[i] == ">")
            closeTag++;
    }
    if(openTag > closeTag)
    {
        while(string[i] != ">")
            i++;
    }

    var newString = string.substring(0,(i+1));
    return newString;


}


};

