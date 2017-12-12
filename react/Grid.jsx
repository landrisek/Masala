import axios from 'axios'
import Datetime from 'react-datetime'
import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import request from 'sync-request'

var ACTIONS = 'actions'
var BUTTONS = 'buttons'
var COLUMNS = 'columns'
var DIALOGS = 'dialogs'
var GRAPH = 'graph'
var GRAPHS = 'graphs'
var LISTENERS = 'listeners'
var LISTS = 'lists'
var ROW = 'row'
var ROWS = 'rows'
var SIZE = 0
var VALIDATORS = 'validators'

export default class Grid extends Component {
    constructor(props) {
        super(props)
        var name = this.constructor.name;
        this.state = JSON.parse(document.getElementById(name[0].toLowerCase() + name.substring(1, name.length)).getAttribute('data'));
    }
    add(event) {
        var state = []
        state[ROW] = this.state[ROW]
        state[ROWS] = this.state[ROWS]
        var rows = state[ROWS][0]
        for(var row in state[ROWS][0]) {
            rows[row] = null
        }
        var data = {id:event.target.id,row:{}}
        for(var row in state[ROW].add) {
            if(null != rows[row] && null != rows[row].Label) {
                rows[row].Label = state[ROW].add[row].Attributes.value
            } else if(null != rows[row] && null != rows[row].Attributes) {
                rows[row].Attributes.value = state[ROW].add[row].Attributes.value
            } else {
                rows[row] = state[ROW].add[row].Attributes.value
            }
            data.row[row] = state[ROW].add[row].Attributes.value
        }
        state[ROWS][event.target.id] = rows
        state[ROW].add = JSON.parse(request('POST', this.state[BUTTONS].dialogs.edit, { json: data }).getBody('utf8'))
        this.setState(state)
    }
    addAction(key) {
        return <div key={'trigger-' + key} style={this.state[BUTTONS][key].style}><a className={this.state[BUTTONS][key].className}
                    id={'trigger-' + key}
                    href={this.state[BUTTONS][key].href}
                    >{this.state[BUTTONS][key].label}</a>
            <a className={this.state[BUTTONS][key].className}
                href={this.state[BUTTONS][key].href}
                id={key}
                key={key}
                style={{display:'none'}}
                onClick={this.bind(this.state[BUTTONS][key].onClick)}>{this.state[BUTTONS][key].label}</a>
            </div>
    }
    addActions(row, key) {
        var container = []
        for(var dialog in this.state[BUTTONS].dialogs) {
            container.push(this.addModal(dialog, key, row))
        }
        for(var action in this.state[ACTIONS]) {
            var id = 'action-' + key + '-' + action
            var href = this.state[ACTIONS][action]['href']
            if(undefined == this.state[ACTIONS][action].onClick) {
                href += '?'
            } else {
                href += '&'
            }
            for(var parameterId in this.state[ACTIONS][action].parameters) {
                href += parameterId + '=' + row[this.state[ACTIONS][action].parameters[parameterId]] + '&'
            }
            if(this.state[ACTIONS][action].url.length > 0) {
                href = row[this.state[ACTIONS][action].url]
            }
            container.push(<div key={id} className='fa-hover col-md-1'><a
                  className={this.state[ACTIONS][action].className}
                  href={href}
                  id={key}
                  onClick={this.bind(this.state[ACTIONS][action].onClick)}
                  target='_blank'
                  title={this.state[ACTIONS][action].label}></a></div>)
        }
        return container
    }
    addButton(key) {
        return <th className={'grid-col-' + key} key={key}>
            <a className={this.state[COLUMNS][key].Attributes.className}
               href={this.state[COLUMNS][key].Attributes.href}
               onClick={this.bind(this.state[COLUMNS][key].Attributes.onClick)}
               id={key}
               key={key}
               title={this.state[COLUMNS][key].Attributes.title}>{this.state[COLUMNS][key].Attributes.Label}</a>
        </th>
    }
    addBody() {
        var body = []
        var rows = this.state[ROWS]
        body.push(this.addSummary())
        var i = 0
        for(var key in rows) {
            var id = 'row-' + i++;
            body.push(<tr id={id} style={rows[key].style} key={id}>{this.addRow(rows[key], key)}</tr>)
            if('object' == typeof(this.state[GRAPHS][key])) {
                body.push(<tr id={'row-graph-' + i} key={'row-graph-' + i} style={{height:'200px'}} ></tr>)
            }
        }
        SIZE = i
        return body
    }
    addCheckbox(key) {
        var th = 'grid-col-' + key
        var columns = this.state[COLUMNS]
        var checked = ''
        if('clicked' == columns[key].Attributes.value) {
            checked = 'checked'
        }
        return <th className={th} key={key} style={columns[key].Attributes.style}>
            {this.addLabel(key)}
            <input id={key}
                   className={columns[key].Attributes.className}
                   data={columns[key].Attributes.data}
                   onClick={this.push.bind(this)}
                   onChange={this.change.bind(this)}
                   style={columns[key].Attributes.style}
                   value={columns[key].Attributes.value}
                   checked={checked}
                   type='checkbox' />
        </th>
    }
    addColumns() {
        var body = []
        var columns = this.state[COLUMNS]
        for (var key in columns) {
            var closure = this[columns[key].Method]
            if('function' == typeof(closure) && false == columns[key].Attributes.filter && false == columns[key].Attributes.unrender) {
                body.push(this[columns[key].Method](key))
            } else if('function' == typeof(closure) && true == columns[key].Attributes.filter && false == columns[key].Attributes.unrender) {
                body.push(this.addEmpty(key))
            }
        }
        return body
    }
    addDateTime(key) {
        return <th className={'grid-col-' + key} id={key} key={key} style={this.state[COLUMNS][key].Attributes.style}>
            {this.addLabel(key)}
            <Datetime locale={this.state[COLUMNS][key].Attributes.locale}
                         onChange={this.datetime.bind(this, key)}
                         value={this.state[COLUMNS][key].Attributes.value}
        /></th>
    }
    datetime(key, event) {
        var state = []
        state[COLUMNS] = this.state[COLUMNS]
        state[COLUMNS][key].Attributes.value = event.format(state[COLUMNS][key].Attributes.format.toUpperCase())
        this.setState(state)
    }
    addDialog(key) {
        if(undefined != this.state[DIALOGS][key]) {
            var container = []
            var rows = this.state[ROW][key]
            for(var row in rows) {
                if('addHidden' == rows[row].Method) {
                    container.push(<input key={key} value={rows[row].Label} type='hidden' />)
                } else if('_submit' == row && 'add' == key) {
                    container.push(<div key={'dialogs-' + row}><input className='form-control btn-success'
                                                                      id={rows[row].Attributes.id}
                                                                      name={rows[row].Attributes.name}
                                                                      value={rows[row].Label}
                                                                      onClick={this.insert.bind(this)}
                                                                      type='submit'/></div>)
                } else if('_submit' == row) {
                    container.push(<div key={'dialogs-' + row}><input className='form-control btn-success'
                                                                      id={rows[row].Attributes.id}
                                                                      name={rows[row].Attributes.name}
                                                                      value={rows[row].Label}
                                                                      onClick={this.update.bind(this)}
                                                                      type='submit'
                                                                      /></div>)
                } else if('select' == rows[row].Tag) {
                    var data = []
                    var options = rows[row].Attributes.data
                    for(var value in options) {
                        if(value == '_' + rows[row].Attributes.value) {
                            data.push(<option key={row + '-' + value} selected='selected' value={value}>{options[value]}</option>)
                        } else {
                            data.push(<option key={row + '-' + value} value={value}>{options[value]}</option>)
                        }
                    }
                    container.push(<div key={'labels-' + row}><label>{rows[row].Label}</label></div>)
                    container.push(<select className='form-control'
                                           id={rows[row].Attributes.id}
                                           key={'dialogs-' + row}
                                           name={rows[row].Attributes.name}
                                           onChange={this.type.bind(this)}>{data}></select>)
                } else if ('addDateTime' == rows[row].Method) {
                    var attributes = rows[row].Attributes
                    attributes.key = key
                    container.push(<div key={'labels-' + row}><label>{rows[row].Label}</label></div>)
                    container.push(<Datetime locale={rows[row].Attributes.locale}
                                             id={rows[row].Attributes.id}
                                             key={'dialogs-' + row}
                                             name={rows[row].Attributes.name}
                                             onChange={this.date.bind(this, {target:attributes})}
                                             value={rows[row].Attributes.value} />)
                } else {
                    rows[row].Attributes.onChange = this.type.bind(this)
                    container.push(<div key={'labels-' + row}><label>{rows[row].Label}</label></div>)
                    container.push(<div key={'dialogs-' + row}>{React.createElement(rows[row].Tag, rows[row].Attributes)}</div>)
                }
                if(null == this.state[VALIDATORS][row]) { } else {
                    container.push(<div key={'validator-' + row} className='bg-danger'>{this.state[VALIDATORS][row]}</div>)
                }
            }
            return <div><a id='trigger-message' style={{display:'hidden'}} data-target={'#masala-' + key} data-toggle='modal'></a>
                <div className='modal fade' id={'masala-' + key} tabIndex='-1' role='dialog' aria-labelledby={key} aria-hidden='true' style={{zIndex:'1099'}}>
                    <div className='modal-dialog'>
                        <div className='modal-content'>
                            <div className='modal-header'>
                                <button type='button' className='close' data-dismiss='modal' aria-hidden='true'>&times;</button>
                                <h4 className='modal-title' id={'masala-label-' + key}>{this.state[DIALOGS][key].label}</h4>
                            </div>
                            <div className='modal-body' id={'masala-' + key + '-modal-body'}>{container}</div>
                        </div>
                    </div>
                </div></div>
        }
    }
    addEmpty(key) {
        return <th key={key} className={'grid-col-' + key}></th>
    }
    addFilters() {
        var body = [];
        var columns = this.state[COLUMNS]
        for (var key in columns) {
            var closure = this[columns[key].Method]
            if('function' == typeof(closure) && true == columns[key].Attributes.filter) {
                body.push(this[columns[key].Method](key))
            }
        }
        return body
    }
    addHidden(key) {}
    addGraphs() {
        var graphs = []
        var header = document.getElementById('masala-header')
        var margin = 0
        var summary = document.getElementById('masala-summary')
        var width = 50
        if(null != header) {
            graphs.push(<tr key='graph-header' style={{height:header.offsetHeight,width:header.offsetWidth,visible:'hidden'}}></tr>)
            graphs.push(<tr key='graph-summery' style={{height:summary.offsetHeight,width:summary.offsetWidth,visible:'hidden'}}></tr>)
            var i = 0
            for(var key in this.state[GRAPHS]) {
                for(var graph in this.state[GRAPHS][key]) {
                    i++
                }
                break
            }
            for(var key in this.state[COLUMNS]) {
                if(key == this.state[GRAPH] || '' == this.state[GRAPH]) {
                    break
                } else if(null != document.getElementById('grid-col-' + key)) {
                    margin += document.getElementById('grid-col-' + key).offsetWidth
                }
            }
            width = (header.offsetWidth - margin) / i
            if(width > 60) {
                width = 60
            }
        }
        for(var key in this.state[ROWS]) {
            if(undefined != this.state[GRAPHS][key]) {
                var row = document.getElementById('row-' + key)
                var container = []
                graphs.push(<tr key={'graph-row-' + key} style={{height:row.offsetHeight,width:row.offsetWidth}}></tr>)
                container.push(<th key='graph-fill' width={margin + ' px'}></th>)
                for(var graph in this.state[GRAPHS][key]) {
                    var value = ''
                    if(this.state[GRAPHS][key][graph].value > 0) {
                        value = this.state[GRAPHS][key][graph].value
                    }
                    container.push(<th className='chart' key={'chart-' + graph} style={{width:width + 'px'}}><span key={'graph-' + graph} style={{height:'100%'}}>
                        <span style={{background:'rgba(209, 236, 250, 0.75)',height:this.state[GRAPHS][key][graph].percent + '%'}}>{value}</span>
                    </span><span>{graph}</span></th>)
                }
                graphs.push(<tr id={'row-fix-' + key} key={'row-fix-' + key}>{container}</tr>)
            }
            if(undefined == this.state[GRAPHS][key] && this.state[GRAPHS].length > 0) {
                var row = document.getElementById('row-' + key)
                graphs.push(<tr key={'graph-row-' + key} style={{height:row.offsetHeight,width:row.offsetWidth}}></tr>)
            }
        }
        return graphs
    }
    addModal(dialog, key) {
        var id = 'dialog-' + dialog + '-' + key
        return <div key={id} className='fa-hover col-md-1'><a
            id={key}
            className={'fa-hover fa fa-' + dialog}
            data-target={'#masala-' + dialog}
            data-toggle='modal'
            onClick={this.bind(dialog)}
            title={dialog}></a></div>
    }
    addMultiSelect(key) {
        var values = new Object()
        var selected = false
        for(var value in this.state[COLUMNS][key].Attributes.value) {
            values[this.state[COLUMNS][key].Attributes.value[value]] = true
            selected = true
        }
        var container = []
        var options = []
        var select = ''
        var total = 0
        var alt = null
        for(var value in this.state[COLUMNS][key].Attributes.data) {
            if(undefined != values[value]) {
                container.push(<li className='list-group-item' 
                                   id={key}
                                   key={key + '-' + value}
                                   onClick={this.click.bind(this)}
                                   value={value}>
                        {this.state[COLUMNS][key].Attributes.data[value]}<span id={key} className='glyphicon glyphicon-remove' value={value} style={{float:'right'}}></span>
                    </li>)
            } else if(this.state[COLUMNS][key].Attributes.autocomplete.trim().length == 0 || null != this.state[COLUMNS][key].Attributes.data[value].toLowerCase().match(this.state[COLUMNS][key].Attributes.autocomplete.toLowerCase())) {
                var style = {}
                if(total == this.state[COLUMNS][key].Attributes.position) {
                    style = {backgroundColor:'rgb(51, 122, 183)',color:'white'}
                    alt = value
                }
                options.push(<li className='list-group-item'
                                 id={key}
                                 key={key + '-' + value}
                                 onClick={this.change.bind(this)}
                                 onKeyDown={this.key.bind(this)}
                                 style={style}
                                 value={value}>{this.state[COLUMNS][key].Attributes.data[value]}</li>)
                total++
            }
        }
        if(true == selected) {
            select = <ul className='list-group'>{container}</ul>
        }
        return <th className={'grid-col-' + key} id={key} key={key}>{this.addLabel(key)}
            {select}
            <div className='input-group'>
                <input alt={alt}
                       className='form-control'
                       name={total}
                       key={key + '-autocomplete'}
                       id={key}
                       onChange={this.autocomplete.bind(this)}
                       onKeyDown={this.key.bind(this)}
                       onClick={this.show.bind(this)}
                       placeholder={this.state[COLUMNS][key].Attributes.placeholder}
                       type='text'
                       value={this.state[COLUMNS][key].Attributes.autocomplete} />
                <div className='input-group-btn'>
                    <ul className='dropdown-menu dropdown-menu-right list-group'
                        id={key}
                        size={this.state[COLUMNS][key].Attributes.size}
                        style={{position:'absolute',zIndex:99,maxHeight:'300px',overflowY:'scroll',display:this.state[COLUMNS][key].Attributes.style.display}}>
                        {options}
                    </ul>
                </div>
            </div>
        </th>
    }
    addLabel(key) {
        if(true == this.state[COLUMNS][key].Attributes.filter) {
            return <label>{this.state[COLUMNS][key].Label}</label>
        }
    }
    addLabels() {
        var labels = []
        var columns = this.state[COLUMNS]
        for (var key in columns) {
            if(true != columns[key].Attributes.unrender && true == columns[key].Attributes.unsort) {
                labels.push(<th key={key + '-sort'} >{columns[key].Label}</th>)
            } else if (true != columns[key].Attributes.unrender) {
                var id = key + '-sort'
                if(undefined != columns[key].Attributes.order) {
                    var order = 'fa fa-sort-' + columns[key].Attributes.order
                } else {
                    var order = 'fa fa-sort'
                }
                labels.push(
                    <th key={id} onClick={this.sort.bind(this, key)}>
                        <a id={id} className='fa-hover' href='javascript:;' title='Sort ascending'>
                            <div className='fa-hover sort'>
                                {columns[key].Label}
                                <i className={order} aria-hidden='true'></i>
                            </div></a>
                    </th>)
            }
        }
        return labels;
    }
    addSettings() {
        if(false == this.state[BUTTONS].setting) {
            return
        }
        var settings = []
        var columns = this.state[COLUMNS]
        for (var key in columns) {
            if(null == /\s/.exec(key) && 'groups' != key) {
                var checked = 'checked'
                if(true == columns[key].Attributes.unrender) { checked = null }
                settings.push(<div key={key + '-setting'} style={{float:'left'}}>
                    <input defaultChecked={checked} id={key} onClick={this.setting.bind(this)} type='checkbox' />&nbsp;&nbsp;{columns[key].Label}&nbsp;&nbsp;
                </div>)
            }
        }
        return <div style={{display:this.state[BUTTONS].setting.display}}>{settings}</div>
    }
    addPaginator() {
        var container = []
        var extent = 9
        if(this.state[BUTTONS].page > 1) {
            container.push(<li key='first-page' className='page-item'><a onClick={this.setPage.bind(this, 1)}>1</a></li>)
            container.push(<li key='previous-page'><a aria-label='Previous' onClick={this.setPage.bind(this, this.state[BUTTONS].page - 1)}><span aria-hidden="true">&laquo;</span></a></li>)
        }
        var i = 0
        while(i < extent) {
            container = this.getPage(container, i++)
        }
        if(this.state[BUTTONS].pages > i) {
            container.push(<li key='next-page'><a aria-label='Next' onClick={this.setPage.bind(this, this.state[BUTTONS].page + i)}><span aria-hidden="true">&raquo;</span></a></li>)
        }
        if(this.state[BUTTONS].pages > this.state[BUTTONS].page && this.state[BUTTONS].page > extent) {
            container.push(<li key='last-page' className='page-item'><a onClick={this.setPage.bind(this, this.state[BUTTONS].pages)}>{this.state[BUTTONS].pages}</a></li>)
            container.push(<li key='last-page'><a aria-label='Previous' onClick={this.setPage.bind(this, this.state[BUTTONS].pages)}><span aria-hidden="true">{this.state[BUTTONS].pages}</span></a></li>)
        }
        return container
    }
    addProgressBar(key){
        var id = key + '-progress'
        if(this.state[BUTTONS][key].length > 0 || undefined === this.state[BUTTONS][key].length || undefined === this.state[BUTTONS].process.length) {
            return <div key={id} className='progress'><div className='progress-bar' style={{width:this.state[BUTTONS][key].width+'%'}}></div></div>
        }
    }
    addRow(rows, key) {
        var container = []
        var hide = true
        for(var row in rows) {
            hide = false
            if(undefined != this.state[COLUMNS][row] && true != this.state[COLUMNS][row].Attributes.unrender) {
                if('object' == typeof(rows[row]) && null !== rows[row]) {
                    rows[row].Attributes.id = row
                    rows[row].Attributes.name = key
                    rows[row].Attributes.onChange = this.update.bind(this)
                    if(null == rows[row].Attributes.value) {
                        rows[row].Attributes.value = ''
                    }
                    var element = React.createElement(rows[row].Tag, rows[row].Attributes, rows[row].Label)
                    container.push(<td id={'grid-col-' + row} key={'grid-col-' + key + row} style={rows[row].Attributes.style}>{element}</td>)
                } else {
                    container.push(<td id={'grid-col-' + row} key={'grid-col-' + key + row}>{rows[row]}</td>)
                }
            }
        }
        if(false == hide) {
            container.push(<td key={'grid-col-' + key + '-actions'}>{this.addActions(rows, key)}</td>)
        }
        return container
    }
    addSelect(key) {
        return <th className={'grid-col-' + key} key={key} style={this.state[COLUMNS][key].Attributes.style}>
                {this.addLabel(key)}
                <select className={this.state[COLUMNS][key].Attributes.className}
                        id={key}
                        onChange={this.change.bind(this)}
                        >{this.getOptions(key)}>
                </select></th>
    }
    addSummary() {
        var container = []
        for (var key in this.state[COLUMNS]) {
            var id = 'summary-' + key
            if(true != this.state[COLUMNS][key].Attributes.unrender && false === isNaN(parseInt(this.state[COLUMNS][key].Attributes.summary))) {
                container.push(<td key={id}>{this.state[COLUMNS][key].Attributes.summary}</td>)
            } else if(true != this.state[COLUMNS][key].Attributes.unrender) {
                container.push(<td key={id}></td>)
            }
        }
        return <tr id='masala-summary' key='masala-summary'>{container}</tr>
    }
    addText(key) {
        return <th className={'grid-col-' + key} key={key} style={this.state[COLUMNS][key].Attributes.style}>
            {this.addLabel(key)}
            <input id={key}
                className={this.state[COLUMNS][key].Attributes.className}
                data={this.state[COLUMNS][key].Attributes.data}
                onBlur={this.change.bind(this)}
                onChange={this.change.bind(this)}
                onKeyPress={function(event) { if('Enter' == event.key) { $('#trigger-send').trigger('click') } }}
                style={this.state[COLUMNS][key].Attributes.style}
                value={this.state[COLUMNS][key].Attributes.value}
                type='text' />
        </th>
    }
    autocomplete(event) {
        var state = []
        state[COLUMNS] = this.state[COLUMNS]
        if('none' == state[COLUMNS][event.target.id].Attributes.style.display) {
            state[COLUMNS][event.target.id].Attributes.style.display = 'block'
        }
        state[COLUMNS][event.target.id].Attributes.autocomplete = event.target.value
        this.setState(state)
    }
    bind(method) {
        if(undefined === method) {
            return
        }
        var closure = method.replace(/\(/, '').replace(/\)/, '')
        if('function' == typeof(this[closure])) {
            return this[closure].bind(this)
        }
    }
    change(event) {
        var state = []
        state[COLUMNS] = this.state[COLUMNS]
        if('click' == event.type) {
            state[COLUMNS][event.target.id].Attributes.autocomplete = ''
            state[COLUMNS][event.target.id].Attributes.position = 0
            state[COLUMNS][event.target.id].Attributes.value.push(event.target.getAttribute('value'))
            if('_' == event.target.getAttribute('value')) {
                state[COLUMNS][event.target.id].Attributes.value = []
            }
        } else if('checkbox' == event.target.type && 'on' == event.target.value) {
            state[COLUMNS][event.target.id].Attributes.value = 'clicked'
        } else if('checkbox' == event.target.type && 'clicked' == event.target.value) {
            state[COLUMNS][event.target.id].Attributes.value = 'on'
        } else {
            state[COLUMNS][event.target.id].Attributes.value = event.target.value
        }
        this.setState(state)
    }
    click(event) {
        var state = []
        state[COLUMNS] = this.state[COLUMNS]
        for(var key in this.state[COLUMNS][event.target.id].Attributes.value) {
            if(event.target.getAttribute('value') == state[COLUMNS][event.target.id].Attributes.value[key]) {
                delete state[COLUMNS][event.target.id].Attributes.value[key]
            }
        }
        this.setState(state)
    }
    componentWillMount() {
        document.addEventListener('click', this.hide.bind(this));
        if(this.state[LISTENERS].length > 0) {
            document.addEventListener('keydown', this.keyDown.bind(this));
        }
    }
    componentWillUnmount() {
        this.forceUpdate()
        document.removeEventListener('click', this.hide.bind(this));
        if(this.state[LISTENERS].length > 0) {
            document.removeEventListener('keydown', this.keyDown.bind(this));
        }
    }
    done(payload, key) {
        var response = JSON.parse(request('POST', this.state[BUTTONS].done.link, { json: payload }).getBody('utf8'))
        if(undefined != response.redirect) {
            window.location.href = response.redirect
        }
        var buttons = this.state[BUTTONS]
        for(var attribute in response) {
            buttons.done[attribute] = response[attribute]
        }
        buttons.done.style.display = 'block'
        if(undefined != buttons.process.link) {
            buttons.process.className = 'btn btn-success'
        }
        buttons.send.className = 'btn btn-success'
        buttons[key].width = 100
        var state = []
        state[BUTTONS] = buttons
        this.setState(state)
    }
    edit(event) {
        var data = {id:event.target.id,row:{}}
        var rows = this.state[ROWS][event.target.id]
        var state = []
        for(var row in rows) {
            if(null != rows[row] && null != rows[row].Label) {
                data.row[row] = rows[row].Label
            } else if(null != rows[row] && null != rows[row].Attributes) {
                data.row[row] = rows[row].Attributes.value
            } else {
                data.row[row] = rows[row]
            }
        }
        state[ROW] = this.state[ROW]
        state[ROW].edit = JSON.parse(request('POST', this.state[BUTTONS].dialogs.edit, { json: data }).getBody('utf8'))
        this.setState(state)
    }
    filter() {
        return JSON.parse(request('POST', this.state[BUTTONS]['filter'], { json: this.getSpice() }).getBody('utf8'))
    }
    getOptions(key) {
        var container = []
        var options = this.state[COLUMNS][key].Attributes.data
        for(var value in options) {
            var id = options[value]
            var option = key + '-' + value
            if(value == this.state[COLUMNS][key].Attributes.value) {
                container.push(<option key={option} selected='selected' value={value}>{id}</option>)
            } else {
                container.push(<option key={option} value={value}>{id}</option>)
            }
        }
        return container
    }
    getPage(container, i) {
        if(this.state[BUTTONS]['page'] + i <= this.state[BUTTONS]['pages']) {
            var page = 'page' + (this.state[BUTTONS]['page'] + i)
            if(0 == i) {
                container.push(<li className='page-item active' key={page}><a onClick={this.setPage.bind(this, this.state[BUTTONS]['page'] + i)}>{this.state[BUTTONS]['page'] + i}</a></li>)
            } else {
                container.push(<li className='page-item' key={page}><a onClick={this.setPage.bind(this, this.state[BUTTONS]['page'] + i)}>{this.state[BUTTONS]['page'] + i}</a></li>)
            }

        }
        return container
    }
    getSpice() {
        var spice = new Object()
        var sort = new Object()
        var columns = this.state[COLUMNS]
        for (var key in columns) {
            if('string' == typeof(columns[key].Attributes.value) && columns[key].Attributes.value.length > 0) {
                spice[key] = columns[key].Attributes.value
            } else if(undefined != columns[key].Attributes.value) {
                for (var value in columns[key].Attributes.value) {
                    if(undefined == spice[key]) {
                        spice[key] = []
                    }
                    spice[key].push(columns[key].Attributes.value[value])
                }
            }
            if(undefined != columns[key].Attributes.order) {
                sort[key] = columns[key].Attributes.order
            }
        }
        var url = this.state[BUTTONS].link + JSON.stringify(spice) +  '&masala-page=' + this.state[BUTTONS].page  + '&masala-sort=' + JSON.stringify(sort)
        window.history.replaceState('', 'title', url)
        var data = new Object()
        data.filters = spice
        data.sort = sort
        data.offset = this.state[BUTTONS].page
        return data
    }
    graphs(event) {
        for(var row in this.state[ROWS]) {
            var mock = {target:{id:row,href:this.state[COLUMNS][event.target.id].Attributes.link}}
            mock.preventDefault = function(){}
            this.signal(mock)
        }
    }
    hide() {
        var update = false
        for(var list in this.state[LISTS]) {
            if('block' == this.state[COLUMNS][list].Attributes.style.display && 'undefined' == typeof(state)) {
                var state = []
                state[COLUMNS] = this.state[COLUMNS]
            }
            if('block' == this.state[COLUMNS][list].Attributes.style.display || this.state[COLUMNS][list].Attributes.autocomplete.length > 0) {
                state[COLUMNS][list].Attributes.autocomplete = ''
                state[COLUMNS][list].Attributes.style.display = 'none'
                update = true
            }
        }
        if(true == update) {
            this.setState(state)
        }
    }
    insert(event) {
        var state = []
        state[ROWS] = this.state[ROWS]
        state[VALIDATORS] = JSON.parse(request('POST', this.state[BUTTONS].validate, {json: {row:state[ROWS][event.target.name]}}).getBody('utf8'))
        for (var validator in state[VALIDATORS]) {
            this.setState(state)
            return
        }
        state[ROWS][event.target.name] = JSON.parse(request('POST', this.state[DIALOGS].add.link, { json: {row:this.state[ROWS][event.target.name]} }).getBody('utf8'))
        this.setState(state)
        this.submit()
    }
    key(event) {
        if(38 == event.keyCode || 40 == event.keyCode || 13 == event.keyCode) {
            var state = []
            state[COLUMNS] = this.state[COLUMNS]
            if(13 == event.keyCode && '_' != event.target.alt) {
                state[COLUMNS][event.target.id].Attributes.autocomplete = ''
                state[COLUMNS][event.target.id].Attributes.value.push(event.target.alt)
            } else if(event.target.name > this.state[COLUMNS][event.target.id].Attributes.position && 40 == event.keyCode) {
                state[COLUMNS][event.target.id].Attributes.position++
                this.setState(state)
            } else if(this.state[COLUMNS][event.target.id].Attributes.position >= event.target.name && 40 == event.keyCode) {
                state[COLUMNS][event.target.id].Attributes.position = 0
            } else if(this.state[COLUMNS][event.target.id].Attributes.position == 0 && 38 == event.keyCode) {
                state[COLUMNS][event.target.id].Attributes.position = event.target.name
            } else if (this.state[COLUMNS][event.target.id].Attributes.position > 0 && 38 == event.keyCode) {
                state[COLUMNS][event.target.id].Attributes.position--
            }
            this.setState(state)
        }
    }
    keyDown(event) {
        for(var listener in this.state[LISTENERS]) {
            if(this.state[LISTENERS][listener] == event.keyCode) {
                var state = new Object()
                var data = {columns:this.state[COLUMNS],rows:this.state[ROWS]}
                state[ROWS] = JSON.parse(request('POST', this.state[BUTTONS].listen, { json: data }).getBody('utf8'))
                if('string' == typeof(state[ROWS])) {
                    this.message(state[ROWS])
                } else {
                    this.setState(state)
                }
            }
        }
    }
    message(message) {
        document.getElementById('masala-message-modal-body').insertAdjacentHTML('afterbegin', '<p>' + message + '</p>')
        $('#trigger-message').trigger('click')
    }
    paginate() {
        var data = this.getSpice()
        var response = request('POST', this.state[BUTTONS].paginate, { json: data }).getBody('utf8')
        var state = []
        state[BUTTONS] = this.state[BUTTONS]
        state[BUTTONS].pages = response
        this.setState(state)
        return data
    }
    prepare(event) {
        var data = this.getSpice()
        data.offset = 0
        var response = JSON.parse(request('POST', this.state[BUTTONS][event.target.id].link, { json: data }).getBody('utf8'))
        if(undefined == response.message) {
            var state = []
            var element = this.state[BUTTONS][event.target.id]
            element.className = 'btn btn-success disabled'
            state[event.target.id] = element
            this.setState(state)
            this.run(response, 'export')
        } else {
            this.message(response.message)
            this.forceUpdate()
        }
    }
    push(event) {
        var data = this.getSpice()
        data.key = event.target.id
        data.columns = this.state[COLUMNS]
        data.rows = this.state[ROWS]
        var response = JSON.parse(request('POST', this.state[BUTTONS].push, { json: data }).getBody('utf8'))
        if(undefined == response.message) {
            var state = new Object()
            state[ROWS] = response.rows
            if(this.state[BUTTONS].pages > 2) {
                state[BUTTONS] = this.state[BUTTONS]
                state[BUTTONS].pages = Math.round(parseFloat(state[BUTTONS].pages) + parseFloat(response.pages))
            }
            this.setState(state)
        } else {
            this.message(response.message)
        }
        this.forceUpdate()
    }
    render() {
        var dialogs = []
        for(var dialog in this.state[DIALOGS]) {
            if('edit' != dialog) {
                dialogs.push(<a className='btn btn-success'
                                data-link={this.state[DIALOGS][dialog].link}
                                data-target={'#masala-' + dialog}
                                data-toggle='modal'
                                id={this.state[DIALOGS][dialog].id}
                                key={'dialog-' + dialog}
                                onClick={this.bind(this.state[DIALOGS][dialog].onClick)}
                                style = {{marginRight: '10px'}}
                                title='edit'
                                type='button'
                >{this.state[DIALOGS][dialog].label}</a>)
            }
        }
        var triggers = []
        for(var trigger in this.state[BUTTONS].triggers) {
            triggers.push(this.addAction(this.state[BUTTONS].triggers[trigger]))
        }
        document.getElementById('grid').style.display = 'block'
        var loader = document.getElementById('loader')
        if(null != loader) {
            loader.style.display = 'none'
        }
        return <div>
            <ul key='paginator' id='paginator' className='pagination'>{this.addPaginator()}</ul>
            <table style={{width:'100%'}}><tbody>
                <tr><td>{this.addProgressBar('export')}{this.addFilters()}</td></tr>
                <tr><td style={{paddingTop:'10px'}}>{dialogs}{triggers}</td></tr>
            </tbody></table>
            {this.addSettings()}
            <table className='table table-striped table-hover' style={{position:'relative'}}>
                <thead id='masala-header'>
                    <tr className='grid-labels'>{this.addLabels()}</tr>
                    <tr className='grid-columns'>{this.addColumns()}</tr>
                </thead>
                <tbody>{this.addBody()}</tbody>
                <tbody className='chart' style={{backgroundImage:'none',position:'absolute',top:'0px'}}>{this.addGraphs()}</tbody>
            </table>
            <ul key='down-paginator' id='down-paginator' className='pagination'>{this.addPaginator()}</ul>
            {this.addDialog('add')}{this.addDialog('edit')}
        </div>
    }
    reset() {
        var state = []
        var columns = this.state[COLUMNS]
        for(var filter in columns) {
            if('object' == typeof(columns[filter].Attributes.value)) {
                columns[filter].Attributes.value = []
            } else if('string' == typeof(columns[filter].Attributes.value) && 'addCheckbox' == columns[filter].Method) {
                columns[filter].Attributes.value = 'on'
            } else if('string' == typeof(columns[filter].Attributes.value) && 'addSelect' == columns[filter].Method) {
                columns[filter].Attributes.value = '_'
            } else if('string' == typeof(columns[filter].Attributes.value)) {
                columns[filter].Attributes.value = ''
            }
            columns[filter].Attributes.order = null
        }
        state[COLUMNS] = columns
        var buttons = this.state[BUTTONS]
        buttons.done.style = {display:'none'}
        buttons.send.className = 'btn btn-success'
        if(undefined != this.state[BUTTONS].export.className) {
            buttons.export.width = 0
            buttons.export.className = 'btn btn-success'
        }
        if(undefined != this.state[BUTTONS].excel.className) {
            buttons.excel.width = 0
            buttons.excel.className = 'btn btn-success'
        }
        state[BUTTONS] = buttons
        this.setState(state)
        this.getSpice()
        this.forceUpdate()
    }
    remove(event) {
        if(false === confirm(this.state[BUTTONS].proceed)) {
            return
        }
        this.signal({target:{id:event.target.id,href:this.state[BUTTONS].remove},preventDefault(){}})
    }
    run(payload, key) {
        if(parseInt(payload.stop) > parseInt(payload.offset)) {
            axios.post(this.state[BUTTONS].run, payload).then(response => {
                var buttons = this.state[BUTTONS]
                buttons[key].width = payload.offset / (payload.stop / 100)
                var state = []
                state[BUTTONS] = buttons
                if('service' == response.data.status && 'object' == typeof(response.data.row) && SIZE > payload.offset) {
                    state[ROWS] = this.state[ROWS]
                    for(var row in response.data.row) {
                        state[ROWS][row] = response.data.row[row]
                    }
                }
                this.setState(state)
                this.run(response.data, key)
            })
        } else {
            this.done(payload, key)
        }
    }
    setPage(page) {
        if(page <= this.state[BUTTONS].pages) {
            var state = []
            state[BUTTONS] = this.state[BUTTONS]
            state[BUTTONS].page = page
            state[ROWS] = this.filter()
            this.setState(state)
            this.summary(this.paginate())
        }
    }
    setting(event) {
        var state = []
        var buttons = this.state[BUTTONS]
        if('checkbox' === event.target.type) {
            var columns = this.state[COLUMNS]
            if(true == columns[event.target.id].Attributes.unrender) {
                columns[event.target.id].Attributes.filter = false
                columns[event.target.id].Attributes.unrender = false
            } else {
                columns[event.target.id].Attributes.filter = true
                columns[event.target.id].Attributes.unrender = true
            }
            var data = new Object()
            data[event.target.id] = columns[event.target.id].Attributes.unrender
            state[COLUMNS] = columns
            request('POST', this.state[BUTTONS].setting.link, { json: data })
        } else {
            if('block' == buttons.setting.display) {
                buttons.setting.display = 'none'
            } else {
                buttons.setting.display ='block'
            }
            state[BUTTONS] = buttons
        }
        this.setState(state)
    }
    signal(event) {
        event.preventDefault()
        var response = JSON.parse(request('POST', event.target.href, { json: {spice:this.getSpice(),row:this.state[ROWS][event.target.id] }}).getBody('utf8'))
        var state = []
        if(true === response.remove) {
            var element = this.state[ROWS]
            delete element[event.target.id]
            state[ROWS] = element
            this.setState(state)
        } else if(true === response.submit) {
            this.submit()
        } else if(undefined != response.graph && undefined == this.state[GRAPHS][event.target.id]) {
            state[GRAPH] = response.graph
            state[GRAPHS] = this.state[GRAPHS]
            state[GRAPHS][event.target.id] = response.data
            this.setState(state)
        } else if(undefined != response.graph) {
            state[GRAPHS] = this.state[GRAPHS]
            delete state[GRAPHS][event.target.id]
            this.setState(state)
        }
        this.forceUpdate()
    }
    show(event) {
        var state = []
        state[COLUMNS] = this.state[COLUMNS]
        state[COLUMNS][event.target.id].Attributes.style.display = 'block'
        this.setState(state)
    }
    start() {
        var state = this.state
        state[ROWS] = this.filter()
        state[BUTTONS] = this.state[BUTTONS]
        this.setState(state)
        this.summary(this.paginate())
    }
    submit(event) {
        var state = []
        if('object' == typeof(event) && 'Enter' == event.key) {
            var columns = this.state[COLUMNS]
            var element = columns[event.target.id]
            element.Attributes.value = event.target.value
            columns[event.target.id] = element
            state[COLUMNS] = columns
        } else if('object' == typeof(event) && 'click' != event.type) {
            return
        }
        state[BUTTONS] = this.state[BUTTONS]
        state[BUTTONS].page = 1
        this.setState(state)
        state[ROWS] = this.filter()
        this.setState(state)
        this.summary(this.paginate())
    }
    summary(data) {
        var columns = this.state[COLUMNS]
        for (var key in columns) {
            if(true == columns[key].Attributes.unrender || false === columns[key].Attributes.summary) { } else {
                data['summary'] = key
                columns[key].Attributes.summary = JSON.parse(request('POST', this.state[BUTTONS]['summary'], { json: data }).getBody('utf8'))
            }
        }
        var state = []
        state[COLUMNS] = columns
        this.setState(state)
    }
    sort(key) {
        var columns = this.state[COLUMNS]
        var element = columns[key]
        if(undefined == element.Attributes.order) {
            element.Attributes.order = 'asc'
        } else if('asc' == element.Attributes.order) {
            element.Attributes.order = 'desc'
        } else if ('desc' == element.Attributes.order) {
            element.Attributes.order = undefined
        }
        var state = []
        state[key] = element
        state[BUTTONS] = this.state[BUTTONS]
        state[BUTTONS]['page'] = 1
        this.setState(state)
        this.submit()
    }
    toggle(event) {
        var state = []
        state[COLUMNS] = this.state[COLUMNS]
        if('block' == state[COLUMNS][event.target.id].Attributes.style.display) {
            state[COLUMNS][event.target.id].Attributes.style.display = 'none'
        } else {
            state[COLUMNS][event.target.id].Attributes.style.display = 'block'
        }
        this.setState(state)
    }
    date(event, time) {
        var state = []
        state[ROW] = this.state[ROW]
        state[ROWS] = this.state[ROWS]
        state[ROW][event.target.key][event.target.id].Attributes.value = time.format(state[ROW][event.target.key][event.target.id].Attributes.format.toUpperCase())
        state[ROWS][event.target.name][event.target.id] = state[ROW][event.target.key][event.target.id].Attributes.value
        this.setState(state)
    }
    type(event) {
        var state = []
        state[ROW] = this.state[ROW]
        state[ROWS] = this.state[ROWS]
        var id = 'edit'
        if(event.target.name < 0) {
            id = 'add'
        }
        state[ROW][id][event.target.id].Attributes.value = event.target.value
        if('checkbox' == event.target.type && 1 == event.target.value) {
            state[ROW][id][event.target.id].Attributes.value = 0
            delete state[ROW][id][event.target.id].Attributes.checked
            state[ROWS][event.target.name][event.target.id] = 0
        } else if('checkbox' == event.target.type && 0 == event.target.value) {
            state[ROW][id][event.target.id].Attributes.value = 1
            state[ROW][id][event.target.id].Attributes.checked = 'checked'
            state[ROWS][event.target.name][event.target.id] = 1
        } else if(null != state[ROWS][event.target.name][event.target.id] && null != state[ROWS][event.target.name][event.target.id].Label) {
            state[ROWS][event.target.name][event.target.id].Label = event.target.value
        } else {
            state[ROWS][event.target.name][event.target.id] = event.target.value
        }
        this.setState(state)
    }
    update(event) {
        var data = {id:event.target.id,row:{},submit:false}
        var state = []
        state[ROWS] = this.state[ROWS]
        if(null == state[ROWS][event.target.name][event.target.id]) {
            state[VALIDATORS] = JSON.parse(request('POST', this.state[BUTTONS].validate, {json: {row:state[ROWS][event.target.name]}}).getBody('utf8'))
            for (var validator in state[VALIDATORS]) {
                this.setState(state)
                return
            }
            data.submit = true
        } else if('checkbox' == event.target.type && 1 == event.target.value) {
            delete state[ROWS][event.target.name][event.target.id].Attributes.checked
            state[ROWS][event.target.name][event.target.id].Attributes.value = 0
        } else if('checkbox' == event.target.type && 0 == event.target.value) {
            state[ROWS][event.target.name][event.target.id].Attributes.checked = 'checked'
            state[ROWS][event.target.name][event.target.id].Attributes.value = 1
        } else {
            state[ROWS][event.target.name][event.target.id].Attributes.value = event.target.value
        }
        data.row = state[ROWS][event.target.name]
        state[ROWS][event.target.name] = JSON.parse(request('POST', this.state[BUTTONS].update, { json: data }).getBody('utf8'))
        this.setState(state)
    }

}
var element = document.getElementById('grid')
if(null != element) {
    ReactDOM.render(<Grid />, document.getElementById('grid')).start()
}