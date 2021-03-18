import React from 'react';
import './App.scss';
import {createApiClient, Ticket} from './api';
import Resizebar from "./Resize";
import ShowLessMore from "./ShowLessMore";

export type AppState = {
	tickets?: Ticket[],
	search: string,
	page: number,
	totalPages: number,
	specialSearch: any,
	searchType: string
}

const api = createApiClient();

export class App extends React.PureComponent<{}, AppState> {

	state: AppState = {
		search: '',
		page: 1,
		totalPages: -1,
		searchType: "",
		specialSearch: null
	}

	async componentDidMount() {
		this.setState({totalPages: parseInt(await api.getTotalPages(this.state.search, this.state.searchType, this.state.specialSearch))})
		let update:Ticket[] = await api.getTickets(this.state.searchType, this.state.specialSearch, this.state.search, this.state.page)
		this.setState({tickets: update})
		this.setState({totalPages: parseInt(await api.getTotalPages(this.state.search, this.state.searchType, this.state.specialSearch))})
	}

	// ** functions for Rename Task (1b) **
	handleRename(ind: number){
		let replaceTitle = window.prompt("Enter new title:")
		if(this.state.tickets && replaceTitle) {
			const update: Ticket[] = [...this.state.tickets]
			update[ind].title = replaceTitle
			this.setState({tickets:update})
		}
	}

	async handlePersistRename(ind: number){
		const replaceTitle = window.prompt("Enter new title:")
		// @ts-ignore
		await api.postRenameItem(this.state.tickets[ind].id, replaceTitle)
		this.setState({tickets:
				[...await api.getTickets(this.state.searchType, this.state.specialSearch,
					this.state.search, this.state.page)]})
	}


	// ** functions for 2b task **
	incPage = () => {
		this.incUpdateTickets()
		this.setState({page: this.state.page+1})
	}
	async incUpdateTickets() {
		this.setState({tickets: await api.getTickets(this.state.searchType,
				this.state.specialSearch, this.state.search, this.state.page+1)})
	}

	decPage = () => {
		this.decUpdateTickets()
		this.setState({page: this.state.page-1})
	}
	async decUpdateTickets() {
		this.setState({tickets: await api.getTickets(this.state.searchType,
				this.state.specialSearch, this.state.search, this.state.page-1)})
	}


	// ** function for clone Task (2a) **
	async handleClone(ind: number){
		// @ts-ignore
		const toClone: Ticket = this.state.tickets[ind]
		if(await api.clone(toClone))
			alert("Successfully cloned.")
		await this.componentDidMount()
	}

	// ** functions for before-after-from Task (2c bonus) **
	async searchBeforeAfter (date:number, toSearch:string, searchType: string) {
		this.setState({
			search: toSearch,
			specialSearch: new Date(date),
			searchType: searchType,
			page: 1
		})
		await this.componentDidMount()
	}

	async searchFrom (email: string, toSearch: string) {
		this.setState({
			search: toSearch,
			specialSearch: email,
			searchType: "from",
			page: 1
		})
		await this.componentDidMount()
	}

	// ** functions for part 3 **
	movePage = () => {
		const totalPages:number = this.state.totalPages
		let input = window.prompt("Enter page num:")
		const moveTo:number = (input!==null && !isNaN(Number(input))) ? parseInt(input) : -1
		if(moveTo < 1 || moveTo > totalPages) {
			alert("Invalid num of page")
			return this.state.page
		}
		this.asyncMovePage(moveTo)
		return moveTo
	}

	async asyncMovePage(moveTo: number){
		this.setState({page: moveTo})
		await this.componentDidMount()
	}

	onSearch = async (val: string) => {
		const before:number = val.search("before:"),
			after:number = val.search("after:"),
			from:number = val.search("from:"),
			fPrefix: number = val.indexOf(' '),
			potParam:string = (val.substring(val.indexOf(':') + 1, fPrefix >= 0 ? fPrefix : val.length)),
			isDate:boolean = !isNaN(Date.parse(potParam)),
			isEmail: boolean = checkEmail(potParam)
		if(before === 0 && isDate) //search before date
			await this.searchBeforeAfter(Date.parse(potParam), val.substring(8 + potParam.length).trim(), "before")
		else if(after === 0 && isDate) { //search after date
			await this.searchBeforeAfter(Date.parse(potParam), val.substring(7 + potParam.length).trim(), "after")
		}
		else if(from === 0 && isEmail) //search from email
			await this.searchFrom(potParam, val.substring(5 + potParam.length))
		else { // regular search
			this.setState({
				search: val,
				page: 1,
				searchType: "regular",
				specialSearch: null
			})
			await this.componentDidMount()
		}
	}

	renderTickets = (tickets: Ticket[]) => {
		return (<ul className='tickets'>
			{tickets.map((ticket, index) =>(
				<li key={ticket.id} className='ticket'>
					<button style={{position: "absolute", right: 175}} onClick = {() => this.handleRename(index)}> Rename </button>
					<button style={{position: "absolute", right: 60}} onClick = {() => this.handlePersistRename(index)}> Persist Rename </button>
					<button style={{position: "absolute", right: 5}} onClick = {() => this.handleClone(index)}> Clone </button>
					<h5 className='title'>{ticket.title}</h5>
					<p className="p" id={tickets[index].id}>{ticket.content}</p>
					{ticket.content.length > 400 ? <ShowLessMore id={tickets[index].id}/> : null}
					<footer>
						<div className='meta-data'>By {ticket.userEmail} | { new Date(ticket.creationTime).toLocaleString()}</div>
					</footer>
				</li>))}
		</ul>);
	}

	render() {
		const {tickets} = this.state;
		return (
		<main>
			<div style={{textAlign: "end", position: "relative", bottom: "-60px"}}>
				<footer style={{position: "relative", left: "-8px"}}> Font Preferences: </footer>
				<Resizebar />
			</div>
			<h1>Tickets List</h1>
			<header >
				<input type="search" placeholder="Search..." onChange={(e) => this.onSearch(e.target.value)}/>
				{this.state.specialSearch !== null ?
					<div className='results' style={{fontSize: "small"}}>
						Searching {this.state.searchType + " " + parseSpecialSearch(this.state.specialSearch)}...
					</div>
				: null}
			</header>
			{this.state.totalPages > 1 ? <div>
				Page control:
				{this.state.page > 1 ? <button onClick={this.decPage}> Prev </button> : null}
				{this.state.totalPages > this.state.page ? <button onClick={this.incPage}> Next </button> : null} <br/>
				<button onClick={this.movePage} style={{position:"relative", left: 98}}> Move to page </button>
			</div> : null}
			{tickets && this.state.totalPages > 0 ? <div style={{textAlign: "center", fontSize: "smaller", position:"relative", bottom: 10}}>
				Showing {20 * (this.state.page-1) + 1} - {20 * (this.state.page-1) + tickets.length} results <br/>
				(Page {this.state.page} out of {this.state.totalPages})
			</div> : tickets ? <div style={{textAlign: "center", fontSize: "smaller"}}> No results </div> : null}
			{tickets ? this.renderTickets(tickets) : <h2>Loading..</h2>}
			{this.state.totalPages > 1 ? <div style={{fontSize: "small"}}> Page control:
				{this.state.page > 1 ? <button onClick={this.decPage}> Prev </button> : null}
				{this.state.totalPages > this.state.page ? <button type = "button" onClick={this.incPage}> Next </button> : null}
				<button onClick={this.movePage}> Move to page </button>
			</div> : null}
		</main>)
	}
}

const checkEmail = (s:string) => {
	const splitted:string[] = s.split('@')
	if(splitted.length !== 2)
		return false
	else if(splitted[0].length === 0 || splitted[1].length === 0)
		return false
	else if(splitted[1].indexOf('.') <= 0)
		return false
	return true
}
const parseSpecialSearch = (specialSearch:any) => {
	// @ts-ignore
	if(specialSearch.toString().indexOf('@') > 0)
		return specialSearch
	else
		return new Date(specialSearch).toDateString()
}

export default App;