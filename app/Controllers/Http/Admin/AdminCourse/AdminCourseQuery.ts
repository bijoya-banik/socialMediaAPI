import Course from 'App/Models/Course'
import User from 'App/Models/User'
import NrcCourse from 'App/Models/NrcCourse'
import PreLicensingCourse from 'App/Models/PreLicensingCourse'
import CourseSubscriber from 'App/Models/CourseSubscriber'
export default class AdminCourseQuery{
    public async getAllCarevanCourseQuery(type:string,limit :number)  {
      return Course.query().preload('user').where('activity_type',type).orderBy('order_id','desc').limit(limit)
    }
    public async getCarevanCourseQuery(type:string,page :number)  {
      return Course.query().preload('user').where('activity_type',type).orderBy('order_id','desc').paginate(page, 10)
    }
    public async getCourseDetailsByIdQuery(id)  {
      return Course.query()
            .where('id', id)
            .preload('user')
            .first()
    }
    public async createCarevanCourseQuery(data){
      return Course.create(data)
    }
    public async editCarevanQuery(data){
      await Course.query().where('id',data.id).update(data)
      return  Course.query().where('id',data.id).first()
    }
    public async sortCarevanQuery(data){
      let promiseArray:any = []
      for(let d of data){
        promiseArray.push(
          Course.query().where('id',d.id).update({
            order_id:d.order_id
          })
        )
      }
      await Promise.all(promiseArray);
      return  'done'
    }
    public async deleteCarevanQuery(id :number)  {
      return Course.query().where('id',id).delete()
    }
    async courseSubscribersQuery(page:number,showPage :number,type:string){
      return CourseSubscriber.query().preload('course').preload('user').where('type',type).orderBy('id','desc').paginate(page,showPage)
    }

    async countAllActiveUsersQuery() {
      return User.query().where('status', 'Active').count('id as total').first()
    }
    async yearlySubscribersQuery(page:number,showPage :number) {
      return User.query().select('id','first_name','last_name','email').where('course_status','Member').orderBy('id','desc').paginate(page,showPage)
    }

    async getCourseDetailsById (id:number,user_id:number){
      return Course.query().where('id', id).preload('user').preload('isSubscriber', (builder) => {
                  builder.where('user_id', user_id)
              }).first()
    }
    async getNrcCourse (limit:number){
        return NrcCourse.query().limit(limit).orderBy('order_id','desc');
    }
    async getPreLicensingCourse (limit:number){
        return PreLicensingCourse.query().limit(limit).orderBy('order_id','desc');
    }
    async getNrcCourseCount (){
        return NrcCourse.query().count('* as total')
    }
    async getPreLicensingCourseCount (){
        return PreLicensingCourse.query().count('* as total')
    }
    async getTotalMembershipHolder (){
        return User.query().where('course_status','Member').count('* as total');
    }
    async increaseCourseView (id:number){
        return Course.query().where('id', id).increment('views', 1)
    }
    async createCourseSubscriber (data:any){
        return CourseSubscriber.create(data)

    }
    async updateCourseSubscribers (id:number,data:any){

        return CourseSubscriber.query()
            .where('id', id)
            .update(data)
    }
    async updateUserCourseMembership (user_id:number,expired_at:any){


        return  User.query().where('id',user_id).update({
          course_status:'Member',
          member_expired_at:expired_at
        })
    }


  public async createNarCourse(data){
      return NrcCourse.create(data)
   }
   public async getAllNarCourse(page, size){
      return NrcCourse.query().orderBy('order_id', 'desc').paginate(page, size)
   }
   public async getSingleNarCourse(id){
      return NrcCourse.query().where('id', id).first()
   }
   public async editNarCourse(data){
      return NrcCourse.query().where('id', data.id).update(data)
   }
   public async deleteNarCourse(data){
      return NrcCourse.query().where('id', data.id).delete()
   }
  public async createPreLicensing(data){
      return PreLicensingCourse.create(data)
   }
   public async getAllPreLicensing(page, size){
      return PreLicensingCourse.query().orderBy('order_id', 'desc').paginate(page, size)
   }
   public async getSinglePreLicensing(id){
      return PreLicensingCourse.query().where('id', id).first()
   }
   public async editPreLicensing(data){
      return PreLicensingCourse.query().where('id', data.id).update(data)
   }
   public async deletePreLicensing(data){
      return PreLicensingCourse.query().where('id', data.id).delete()
   }
   public async sortPreLicensing(data){
      let promiseArray:any = []
      for(let d of data){
        promiseArray.push(
          PreLicensingCourse.query().where('id',d.id).update({
            order_id:d.order_id
          })
        )
      }
      await Promise.all(promiseArray);
      return  'done'
   }


}
