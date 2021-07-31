const express=require("express");
const app=express();
const cors=require('cors');
const mongodb=require('mongodb')
const db_URL='mongodb+srv://admin:admin123@cluster0.sln75.mongodb.net/urlshortener?retryWrites=true&w=majority';
const MongoClient=mongodb.MongoClient
const shorten=require('node-url-shortener');



app.use(express.json())
app.use(cors())

app.post("/shorten",async (req,res)=>{
    try{
       
        shorten.short(req.body.longurl,async (err,shorturl)=>{
            if(err){
              res.json({"message":"Couldnt Shorten :("})
                
            }else{
                const client=await MongoClient.connect(db_URL,{ useNewUrlParser: true, useUnifiedTopology: true});
                const db=await client.db("urlshortener")
                const new_entry=await db.collection("urls").insertOne({longurl:req.body.longurl,shortened:shorturl});
                console.log(new_entry);
                res.json({"message":"URL Shortened","new_data":new_entry})
                client.close()
            }
        })
        
    }catch(err){
        res.status(400).json({"message":"Backend Error"})
    }
})

app.get("/allurls",async (req,res)=>{
    const client=await MongoClient.connect(db_URL,{ useNewUrlParser: true, useUnifiedTopology: true});
    try{
        const db=client.db("urlshortener")
        const allURLs=await db.collection("urls").find().toArray();
        res.status(200).json({"message":"Success","data":allURLs});
    }catch(err){
        res.status(400).json({"message":"Backend Error"})
    }finally{
        client.close()
    }
})
app.delete("/delete/:id",async (req,res)=>{
    let btnID=new mongodb.ObjectId(req.params.id)
    console.log(btnID)
    const client=await MongoClient.connect(db_URL,{ useNewUrlParser: true, useUnifiedTopology: true});
    try{
        const db=client.db("urlshortener")
        const deleted_entry=await db.collection("urls").deleteOne({_id:btnID});
        res.status(200).json({"message":"Deleted"});
    }catch(err){
        res.status(400).json({"message":"Backend Error"})
    }finally{
        client.close()
    }
    
})
app.listen(process.env.PORT || 4040,()=>{
    console.log("Server listening ")
})