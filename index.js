import * as sqlite from 'sqlite';
import sqlite3 from 'sqlite3';
import express from 'express';

const app = express();

app.use(express.json());

app.use(express.static('public'));

const db = await sqlite.open({
    filename: './data_plan.db',
    driver: sqlite3.Database
});

console.log('db initialized');

await db.migrate();

app.get('/api/price_plans', async function (req, res) {

    const price_plans = await db.all('select * from price_plan');
    res.json({
        price_plans
    })
});

app.post('/api/phonebill/', async function (req, res) {

    console.log(req.body);

    //get the price plan to use

    const price_plan = await db.get(`SELECT id, plan_name, sms_price, call_price
        FROM price_plan where plan_name = ?`, req.body.price_plan);

    if (!price_plan) {
        res.json({
            error: `Invalid price plan : ${price_plan.plan_name}`
        });
    } else {
        
    //Use the proce plan to calculate the total cost 

    const activity = req.body.action;

    const activities = activity.split(",");
    let total = 0;

    activities.forEach(action => {
        if (action.trim() === 'sms') {
            total += price_plan.sms_price;
        } else if (action.trim() == 'call') {
            total += price_plan.call_price;
        }
    });

res.json({
    
        total
})
    }
});

app.post('/api/price-plan/update', async function(req, res) {
    console.log(req.body)

    const {sms_price, call_price, price_plan} = req.body;
    const result = await db.run('update price_plan set sms_price = ?, call_price = ? where plan_name = ?',
    sms_price,
    call_price,
    price_plan);
    console.log(result)

    res.json({
        status: 'Inserted a new row'
    })
    
});

app.post('/api/price_plan/delete', async function(req, res){
    console.log(req.body)
    const {id} = req.body
    
    const result = await db.run('delete from price_plan where id = ?', id)

    console.log(result)

    res.json({
        status: 'Successfully deleted'
    })
});

app.post('/api/price-plan/insert', async function(req, res) {
    console.log(req.body)

    const {sms_price, call_price, price_plan} = req.body;
    const result = await db.run('UPDATE price_plan set sms_price = ?, call_price = ? where plan_name = ?',
    sms_price,
    call_price,
    price_plan);
    console.log(result)

    res.json({
        status: 'Inserted a new row'
    })
    
});

console.log("done!");

const PORT = process.env.PORT || 6080;
app.listen(PORT, function () {
    console.log(`Price plan started on port ${PORT}`)
});


