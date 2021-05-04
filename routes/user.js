const router = require('express').Router();
const path = '../views/user/';
const Usermovies = require('../models/user_movies');
const domain = require('./domain')
const fetch = require('node-fetch');
const keys = require('../keys');
const movies= require('./movies');
const href = domain.href;
const {data1} = require('./moviedetailsdemo');
const User = require('../models/user');
// let movies = {};
router.get('/home', (req, res) => {
    // console.log(req.user);
    res.render(path + 'user_home.ejs', { path: href });
})

router.get('/homemovies',async (req,res)=>{
    let arr = keys.genres;
    if(JSON.stringify(movies) === JSON.stringify({})){
        let len = arr.length;
        // for(let i=0;i<len;i++){
        //         let id = arr[i].id;
        //         let name = arr[i].name;
        //         // console.log(id,name);
        //         let response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=0aa29159f6dd2a6237127a2053adc853&language=en-US&sort_by=popularity.desc&with_genres=${id}`);
        //         let data = await response.json();
        //         data = data["results"];
        //         // console.log(data);
        //         movies[`${name}`] = data;
    
        // }
    }
    // console.log(movies);
    res.send(movies.movies);
})

router.get('/moviedetails', (req, res) => {
    res.render(path + 'moviedetails.ejs', { path: href });
})

router.get('/favouritelist', (req, res) => {
    res.render(path + 'user_favourite_movies.ejs', { path: href });
})

router.post('/getmoviedetails', async (req, res) => {
    let movieid = req.body.id;
    console.log(movieid);
    let email = req.user.email;
    // let d1=await fetch(`https://api.themoviedb.org/3/movie/${movieid}?api_key=0aa29159f6dd2a6237127a2053adc853&language=en-US&append_to_response=videos,credits`);
    // let data1 = await d1.json();
    
    let userdata = await Usermovies.find({ email, movieid });
    let fav = 0, rate = 0, review = "";
    // console.log(data1);
    if (userdata.length) {
        if (userdata[0].favourite) {
            fav = userdata[0].favourite;
        }
        if (userdata[0].rating) {
            rate = userdata[0].rating;
        }
        if (userdata[0].review) {
            review = userdata[0].review;
        }
    }
    data1.fav = fav;
    data1.rating = rate;
    data1.review = review;
    let reviews=[];
    let temp = await Usermovies.find({movieid});
    let len = temp.length;
    console.log(len);
    for(let i=0;i<len;i++){
        let user = await User.findOne({email : temp[i].email});
        let obj = {
            name : user.name,
            reviewtitle : temp[i].reviewtitle,
            reviewtext : temp[i].reviewtext,
            rating : rate
        };
        reviews.push(obj);
    }
    console.log(reviews);
    data1.reviews = reviews;
    // res.render(path + 'moviedetails', { data: JSON.stringify(data1, null, 2), path: href, fav, rating: rate, review });
    res.send(data1);
})


router.post('/markfav', async (req, res) => {
    let movieid = req.body.id;
    console.log(movieid);
    let email = req.user.email;
    let res1 = await Usermovies.find({ email, movieid });
    console.log(res1);
    if (res1.length) {
        Usermovies.updateOne({ _id: res1[0]._id }, { $set: { "favourite": 1 } }, (err, result) => {
            if (err) throw err;
            res.send(result);
        })
    } else {
        let obj = new Usermovies({
            email,
            movieid,
            favourite: 1
        })
        console.log('here');
        obj.save().then(result => {
            res.send(result);
        })
    }
})

router.post('/unmarkfav', async (req, res) => {
    let movieid = req.body.id;
    // let email = req.user.email;
    let email = req.user.email;
    let res1 = await Usermovies.find({ email, movieid });
    console.log(res1);
    if (res1.length) {
        Usermovies.updateOne({ _id: res1[0]._id }, { $set: { "favourite": 0 } }, (err, result) => {
            if (err) throw err;
            res.send(result);
        })
    } else {
        let obj = new Usermovies({
            email,
            movieid,
            favourite: 0
        })
        console.log('here');
        obj.save().then(result => {
            res.send(result);
        })
    }
})

router.post('/rate', async (req, res) => {
    let movieid = req.body.movieid;
    let rating = req.body.rating;
    let email = req.body.email;
    console.log(email, rating);
    let res1 = await Usermovies.find({ email, movieid });
    console.log(res1);
    if (res1.length) {
        Usermovies.updateOne({ _id: res1[0]._id }, { $set: { "rating": rating } }, (err, result) => {
            if (err) throw err;
            res.send(result);
        })
    } else {
        let obj = new Usermovies({
            email,
            movieid,
            rating
        })
        console.log('here');
        obj.save().then(result => {
            res.send(result);
        })
    }
})

router.post('/review', async (req, res) => {
    let movieid = req.body.movieid;
    let review = req.body.review;
    let email = req.body.email;
    console.log(email, review);
    let res1 = await Usermovies.find({ email, movieid });
    console.log(res1);
    if (res1.length) {
        Usermovies.updateOne({ _id: res1[0]._id }, { $set: { "review": review } }, (err, result) => {
            if (err) throw err;
            res.send(result);
        })
    } else {
        let obj = new Usermovies({
            email,
            movieid,
            review
        })
        console.log('here');
        obj.save().then(result => {
            res.send(result);
        })
    }
})

router.post('/submitreview', async (req,res)=>{
    let data = req.body.data;
    let email = req.user.email;
    let movieid=req.body.id;
    let obj = (Object.fromEntries([...new URLSearchParams(data)]));
    let title=obj.title;
    let text=obj.text;
    let rating=obj.rating;
    let old=await Usermovies.findOne({movieid,email});
    if(old){
        console.log('found');
        await Usermovies.updateOne({movieid,email},{$set : {"reviewtext":text,"reviewtitle":title,"rating":rating}});
    }else{
        let temp = new Usermovies({
            movieid,
            email,
            reviewtext: text,
            reviewtitle: title,
            rating
        })
        temp.save()
    }
    console.log(obj);
    res.send({
        message: 'Review submitted successfully!'
    })
})

router.get('/userfavourite',async (req,res)=>{
    res.render(path+'user_favourite_movies.ejs',{path : href});
})

module.exports = router;