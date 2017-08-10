import React, {Component} from 'react'
import request from 'sync-request'
import Dropzone from 'react-dropzone'

var LINKS = {}

export default class Form extends Component {
    constructor(props){
        super(props);
        var name = this.constructor.name;
        this.state = JSON.parse(document.getElementById(name[0].toLowerCase() + name.substring(1, name.length)).getAttribute('data'))
        LINKS = JSON.parse(document.getElementById(name[0].toLowerCase() + name.substring(1, name.length)).getAttribute('data-links'))
    }
    attached() {
        var body = [];
        for (var key in this.state) {
            var closure = this[this.state[key].Method]
            if('function' == typeof(closure)) {
                body.push(this[this.state[key].Method](key))
            }
        }
        return body;
    }
    addAction(key) {
        return <a key={key}
                  href={this.state[key].Attributes.href}
                  style={this.state[key].Attributes.style}
                  className={this.state[key].Attributes.class}
                  onClick={this.bind(this.state[key].Attributes.onClick)}>{this.state[key].Label}</a>
    }
    addCheckbox(key) {
        return <div key={key} style={this.state[key].Attributes.style}>
                    <input checked={this.state[key].Attributes.checked}
                           id={key}
                           onChange={this.onChange.bind(this)}
                           type='checkbox'
                           value={this.state[key].Attributes.value}  />
                    <label style={{marginLeft:'10px'}}>{this.state[key].Label}</label>
        </div>
    }
    addHidden(key) {
        return <input type='hidden' />
    }
    addMessage(key) {
        return <div key={key} 
                    className='alert alert-success'
                    role='alert'
                    style={this.state[key].Attributes.style}>
                    {this.state[key].Label}</div>
    }
    addMultiSelect(key) {
        return <select key={key} multiple style={this.state[key].Attributes.style}
                                                    onChange={this.onChange.bind(this)}
                                                    className={columns[key].Attributes.class}
                                                    id={columns[key].Attributes.id}>{this.getOptions(key)}>
        </select>
    }
    addProgressBar(key) {
        return <div key={key}
            style={this.state[key].Attributes.style}
            className='progress'><div
            className='progress-bar'
            style={{width:this.state[key].Attributes.width+'%'}}></div></div>
    }
    addRadioList(key) {
        var container = [];
        var options = this.state[key].Attributes.data;
        container.push(<div>{this.addValidator(key)}</div>);
        for (var value in options) {
            container.push(<div key={value}><input name={key} 
                                    onClick={this.bind(this.state[key].Attributes.onClick)}
                                    type='radio'
                                    value={value} />
                                    <label>{this.state[key].Attributes.data[value]}</label></div>);
        }
        return container;
    }
    addSelect(key) {
        return <select style={this.state[key].Attributes.style}
                                   onChange={this.onChange.bind(this)}
                                   className={this.state[key].Attributes.class}
                                   id={key}>{this.getOptions(key)}
                     </select>
    }
    addSubmit(key) {
        return <input
            className={this.state[key].Attributes.class}
            data={this.state[key].Attributes.data}
            id={key}
            key={key}
            onClick={this.bind(this.state[key].Attributes.onClick)}
            style={this.state[key].Attributes.style}
            type='submit'
            value={this.state[key].Label} />
    }
    addUpload(key) {
        var files = []
        for(var file in this.state[key].Attributes.value) {
            var id = key + file
            files.push(<li key={id} className='list-group-item'>{this.state[key].Attributes.value[file]}</li>)
        }
        return <div key={key} style={this.state[key].Attributes.style}>
                <Dropzone onDrop={this.onDrop.bind(this, key)}
                          multiple={false}
                          style={{height:'200px',borderWidth:'2px',borderColor:'rgb(102, 102, 102)',borderStyle:'dashed',borderRadius:'5px'}}>
                    <center>{this.state[key].Label}</center>
                </Dropzone>
                <ul className='list-group'>{files}</ul>
                {this.addValidator(key)}
            </div>
    }
    addValidator(key) {
        var container = [];
        var validators = this.state[key].Validators;
        for (var validator in validators) {
            var id = key + '_' + validator;
            container.push(<div key={id}
                    className='bg-danger'
                    style={this.state[key].Validators[validator].style}>
                    {this.state[key].Validators[validator].value}</div>)
        }
        return container;
    }
    addText(key) {
        return <div key={key} className='input-group'>
            <input 
            id={key}
            className='form-control' 
            data={this.state[key].Attributes.data}
            onBlur={this.bind(this.state[key].Attributes.onBlur)}
            onClick={this.bind(this.state[key].Attributes.onClick)} 
            onChange={this.onChange.bind(this)}
            style={this.state[key].Attributes.style}
            type={this.state[key].Attributes.type}
            value={this.state[key].Attributes.value} />
            <div>{this.addValidator(key)}</div></div>
    }
    addTextArea(key) {
        return <div key={key} className='input-group'>
            <textarea
                id={key}
                className={this.state[key].Attributes.class}
                data={this.state[key].Attributes.data}
                onBlur={this.bind(this.state[key].Attributes.onBlur)}
                onClick={this.bind(this.state[key].Attributes.onClick)}
                onChange={this.onChange.bind(this)}
                style={this.state[key].Attributes.style}>
                {this.state[key].Attributes.value}</textarea>
            <div>{this.addValidator(key)}</div></div>
    }
    addTitle(key) {
        return <h1 key={key} className={this.state[key].Attributes.class}>{this.state[key].Attributes.value}</h1>
    }
    bind(method, data) {
        if(undefined === method) {
            return
        }
        var closure = method.replace(/\(/, '').replace(/\)/, '')
        if('function' == typeof(this[closure])) {
            return this[closure].bind(this, data)
        }
    }
    done(payload) {
        var response = $.ajax({ type:'post',url:LINKS['done'],data:payload,async:false}).responseJSON
        var state = []
        for (var key in this.state) {
            var element = this.state[key]
            element.Attributes.style = {display:'none'}
            state[key] = element
        }
        this.setState(state)
        return response
    }
    getOptions(key) {
        var container = []
        var options = this.state[key].Attributes.data
        for (var value in options) {
            if(this.state[key].Attributes.value == value) {
                container.push(<option selected key={value} value={value}>{this.state[key].Attributes.data[value]}</option>)
            } else {
                container.push(<option key={value} value={value}>{this.state[key].Attributes.data[value]}</option>)
            }
        }
        return container
    }
    isEmail(value) {
        return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value);
    }
    isImage(value) {
        if(value instanceof File) {
            return ['bmp','gif','jpg','jpeg'].indexOf(value.type) > -1            
        }
        for(var file in value) {
            if(-1 == ['.bmp','.gif','.jpg','jpeg'].indexOf(value[file].substr(-4, 5))) {
                return false
            }
        }

    }
    isRequired(value) {
        return (undefined !== value && '' !== value);
    }
    isText(value) {
        if(value instanceof File) {
            return ['application/csv','application/vnd.ms-excel','application/x-csv','text/csv','text/comma-separated-values','text/x-csv',
                    'text/x-comma-separated-values','text/plain','text/tab-separated-values'].indexOf(value.type) > -1
        }
        for(var file in value) {
            if(-1 == ['.csv','.txt','.xls','.xlsx'].indexOf(value[file].substr(-4, 5))) {
                return false
            }
        }
    }
    onDrop(key, files) {
        var element = this.state[key]
        var names = []
        for(var file in files) {
            for(var validator in this.state[key].Validators) {
                var closure = this['is' + validator[0].toUpperCase() + validator.substring(1)];
                if('function' == typeof(closure) && false == closure(files[file])) {
                    element.Validators[validator].style = { display : 'block' }
                } else {
                    element.Validators[validator].style = { display : 'none' }
                    names[this.save(files[file])] = files[file].name
                }
            }
        }
        element.Attributes.value = names
        var state = []
        state[key] = element
        this.setState(state)
    }
    onChange(event) {
        var element = this.state[event.target.id]
        if('checkbox' == event.target.type && 1 == event.target.value) {
            element.Attributes.value = 0
            element.Attributes.checked = null
        } else if('checkbox' == event.target.type) {
            element.Attributes.value = 1
            element.Attributes.checked = 'checked'
        } else {
            element.Attributes.value = event.target.value
        }
        var state = []
        state[event.target.id]
        this.setState(state)
    }
    save(file) {
        var data = new Object()
        data.file = request('GET', file.preview).body
        return $.ajax({type:'post',url:LINKS['save']+'&file='+file.name+'.'+file.type,data:data,async:false}).responseText
    }
    prepare(data, event) {
        var response = $.ajax({type: 'post',url: LINKS['prepare'], data:this.state,async:false}).responseJSON
        this.run(response, event.target.id + '-progress')
    }
    submit() {
        var data = new Object()
        for(var key in this.state) {
            data[key] = this.state[key].Attributes.value
        }
        $.ajax({type:'post', url:LINKS['submit'],data:data,async:false})
    }
    run(payload, progress) {
        var self = this
        if(parseInt(payload.stop) > parseInt(payload.offset)) {
            $.ajax({ type:'post',url:LINKS['run'], data:payload,success: function(payload) { self.run(payload, progress) }})
            var element = this.state[progress]
            element.Attributes.width = payload.offset / (payload.stop / 100)
            var state = []
            state[progress] = element
            this.setState(state)
        } else {
            this.done(payload)
        }
    }
    validate() {
        var validated = true;
        for (var key in this.state) {
            for(var validator in this.state[key].Validators) {
                var closure = this['is' + validator[0].toUpperCase() + validator.substring(1)];
                if(undefined == this.state[key].Attributes.value) {
                    var validate = this.state[key].value
                } else {
                    var validate = this.state[key].Attributes.value
                }
                if('function' == typeof(closure) && false == closure(validate, key)) {
                    var state = [];
                    var element = this.state[key];
                    element.Validators[validator].style = { display : 'block' }
                    state[key] = element
                    this.setState(state)
                    validated = false
                } else {
                    var state = [];
                    var element = this.state[key];
                    element.Validators[validator].style = { display : 'none' }
                    state[key] = element
                    this.setState(state)
                }
            }
        }
        return validated
    }
}