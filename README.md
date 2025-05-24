# Item Storage  
Using various front-end and back-end technologies along with database management, this project provides a user-friendly interface that allows users to register and purchase items,   while also enabling easy access to inventory and related information at a glance.  
Although the hosting service was discontinued on April 10th, 2024 due to server maintenance limitations, the core structure of the website remains intact, leaving room for future   collaboration and further development.

## Contact & Info

Hello my name is Daeuk Kim   
my email is : a24738598@gmail.com  
Develop period : May 18th ~ Apr 6th 2023  
URL Used cyclic: https://proud-teal-bluefish.cyclic.app =>   
unfortunately stopped hosting since **Apr 10th 2024**  

## Used tequniques  

-> CSS(pack,tailwind), Javascript , Html->Ejs (Apr 2nd)  
-> Node.js, Express.js, web protocall  
-> NOSQL, PostgreSQL, json handler, CRUD, mongodb

## Pages  

-> **about** : My own Info  
-> **addcategory** : Add new category by number  
-> **additem** : Add new item by identify number saved to exturnal database  
-> **categories** : Setting product classification criteria  
-> **items** : Handling Items which is on storage  
-> **login** : Identify the customer; this is for authentication  
-> **register** : Add a new client  
-> **shop** : Displaying page of existing item and related Info.  
-> **userHistort** : Track and give info (To protocalled page) of client info Who registered  

### Exceptions  
=> registeration Error : failed validation can cause error(fixed controlled in store-service.js)  
=> server response error: will shown 500  
=> 404 page: when not found  

## Run
**Can Only run In local from Apr 10th 2024**

1. **Clone Repo**
   ```bash
   git clone <https://github.com/daeuk23/DaeukKim-s_ItemCenter.git>
   ```

2. **Install factors**
   ```bash
   npm install => express.js,jason...etc
   ```

3. **Connect to your database**
   Create a `.env` file in the root directory and add:
   ```env
   PORT=8080
   DATABASE_URL=postgres://username:password@localhost:5432/database_name
   SESSION_SECRET=your_session_secret

   your section secret is you will get wherever you connect your database
   ```  
   Link : [mongoDB](https://www.mongodb.com/lp/cloud/atlas/try4-reg?utm_source=google&utm_campaign=search_gs_pl_evergreen_mongodb_general_prosp-brand_gic-null_ww-tier1_ps-all_desktop_eng_lead&utm_term=mongoose%20db&utm_medium=cpc_paid_search&utm_ad=e&utm_ad_campaign_id=22124314770&adgroup=173195497083&cq_cmp=22124314770&gad_source=1&gad_campaignid=22124314770&gbraid=0AAAAADQ1403esFOCBqCnBO2GqIp3dP1eX&gclid=CjwKCAjw3MXBBhAzEiwA0vLXQerGVagwNWYmi7cHoVQSqnBmM9z1kEBQISl0N7HFKDm8rjMJOg8QLRoCNngQAvD_BwE)

4. **Check respond at local port after start**
   ```bash
   npm start
   ```
