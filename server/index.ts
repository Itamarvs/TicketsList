import express from 'express';
import bodyParser = require('body-parser');
import { tempData } from './temp-data';
import {serverAPIPort, APIPath} from '@fed-exam/config'
import {Ticket} from "../client/src/api";

console.log('starting server', { serverAPIPort, APIPath });

const app = express();

const PAGE_SIZE = 20;

app.use(bodyParser.json());

app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

app.get(APIPath, (req, res) => {
    // @ts-ignore
    const page: number = req.query.page;
    // @ts-ignore
    const paginatedData = tempData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    res.send(paginatedData);
});

app.get(`/getBefore`, (req, res) => {
    // @ts-ignore
    const page: number = req.query.page;
    // @ts-ignore
    let paginatedData = tempData.filter(t => (t.creationTime <= Date.parse(req.query.date) && (t.title.toLowerCase() + t.content.toLowerCase()).includes(req.query.toSearch.toLowerCase())))
    paginatedData = paginatedData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    res.send(paginatedData);
});

app.get(`/getAfter`, (req, res) => {
    // @ts-ignore
    const page: number = req.query.page;
    // @ts-ignore
    let paginatedData = tempData.filter(t => (t.creationTime >= Date.parse(req.query.date) && (t.title.toLowerCase() + t.content.toLowerCase()).includes(req.query.toSearch.toLowerCase())))
    // @ts-ignore
    paginatedData = paginatedData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    res.send(paginatedData);
});

app.get(`/searchTickets`, (req, res) => {
    // @ts-ignore
    const page: number = req.query.page;
    // @ts-ignore
    let paginatedData = tempData.filter(t => (t.title.toLowerCase() + t.content.toLowerCase()).includes(req.query.toSearch.toLowerCase()))
    paginatedData = paginatedData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    res.send(paginatedData);
});

app.get(`/ticketsFrom`, (req, res) => {
    // @ts-ignore
    const email: string = req.query.email || "";
    // @ts-ignore
    const page: string = req.query.page || 1;
    // @ts-ignore
    const toSearch:string = req.query.toSearch
    // @ts-ignore
    let paginatedData = tempData.filter(t => (t.title.toLowerCase() + t.content.toLowerCase()).includes(toSearch.toLowerCase()) && t.userEmail === email)
    // @ts-ignore
    paginatedData = paginatedData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    res.send(paginatedData);
});

app.get(`/totalPages`, (req, res) => {
    // @ts-ignore
    const toSearch: string = req.query.toSearch
    // @ts-ignore
    const typeOfSearch: string = req.query.typeOfSearch
    let numOfPages: string
    let paginatedData
    if (typeOfSearch === "regular")
        paginatedData = tempData.filter(t => (t.title.toLowerCase() + t.content.toLowerCase()).includes(toSearch.toLowerCase()))
    else if (typeOfSearch === "before")
        // @ts-ignore
        paginatedData = tempData.filter(t => (t.creationTime <= Date.parse(req.query.param) && (t.title.toLowerCase() + t.content.toLowerCase()).includes(toSearch.toLowerCase())))
    else if (typeOfSearch === "after")
        // @ts-ignore
        paginatedData = tempData.filter(t => (t.creationTime >= Date.parse(req.query.param) && (t.title.toLowerCase() + t.content.toLowerCase()).includes(toSearch.toLowerCase())))
    else if (typeOfSearch === "from")
        paginatedData = tempData.filter(t => (t.title.toLowerCase() + t.content.toLowerCase()).includes(toSearch.toLowerCase()) && t.userEmail === req.query.param)
    else
        paginatedData = tempData
    // @ts-ignore
    numOfPages = (Math.ceil(paginatedData.length / PAGE_SIZE)).toString()
    res.send(numOfPages)
})

app.post(`/clone`,
    (req, res) => {
        const cloned: Ticket = req.body.other
        cloned.id = cloned.id + "_clone"
        tempData.push(cloned)
        res.send(true)
    }
)

app.post(`/postRenameItem`,
    (req, res) => {
        const id: string = req.body.id
        const newTitle: string = req.body.newTitle
        let done = false;
        for(let i = 0; i<tempData.length && !done; i++){
            let t: Ticket = tempData[i]
            if(t.id === id) {
                done = true
                t.title = newTitle
                res.send(true)
            }
        }
        if(!done)
            res.send(false)
        })

app.listen(serverAPIPort);
console.log('server running', serverAPIPort)