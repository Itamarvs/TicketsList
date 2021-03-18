import axios from 'axios';
import {API} from '@fed-exam/config';

export type Ticket = {
    id: string,
    title: string;
    content: string;
    creationTime: number;
    userEmail: string;
    labels?: string[];

}

export type ApiClient = {
    getTickets: (searchType: string, param: any, toSearch: string, page: number) => Promise<Ticket[]>,
    clone: (other: Ticket) => Promise<boolean>,
    searchTickets: (toSearch: string) => Promise<Ticket[]>,
    postRenameItem: (id: string, newTitle: string) => Promise<boolean>,
    getTotalPages: (toSearch: string, typeOfSearch: string, param: string) => Promise<string>
}


export const createApiClient = (): ApiClient => {
    return {
        getTickets: (searchType, param, toSearch, page) => {
            if(searchType === "before")
                return axios.get(API + `/getBefore`, {params: {toSearch: toSearch, date: param, page: page}})
                    .then((res) => res.data);
            else if(searchType === "after") {
                return axios.get(API + '/getAfter', {params: {toSearch: toSearch, date: param, page: page}})
                    .then((res) => res.data);
            }
            else if(searchType === "from")
                return axios.get(API+'/ticketsFrom',{params: {toSearch: toSearch, email: param, page: page}})
                    .then((res) => res.data)
            else //if(toSearch !== "") {
                return axios.get(API + '/searchTickets', {params: {toSearch: toSearch, page: page}})
                    .then((res) => res.data)
        },
        clone: (other) => {
            return axios.post(API + '/clone', {other: other}).then((res) => res.data)
        },
        searchTickets: (toSearch) => {
            return axios.get(API+'/searchTickets',{params: {toSearch: toSearch}}).then((res) => res.data);
        },
        postRenameItem: (id, newTitle) => {
            return axios.post(API+'/postRenameItem', {id: id, newTitle: newTitle}).then((res) => res.data)
        },
        getTotalPages: (toSearch, typeOfSearch, param) => {
            return axios.get(API + '/totalPages', {params: {toSearch: toSearch, typeOfSearch: typeOfSearch, param: param}}).then((res) => res.data)
        }
    }
}
