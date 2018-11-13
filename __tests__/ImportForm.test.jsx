import ImportForm from '../react/ImportForm.jsx'
import React from 'react'
import ReactDOM from 'react-dom'

describe('ImportForm', () => {
    it('works', () => {
        var element = document.createElement('div')
        element.id = 'importForm'
        var data =  '{"row":{"_prepare-progress":{"Attributes":{"width":0,"id":"_prepare-progress","className":"form-control"},"Label":"","Method":"addProgressBar","Tag":"div"},"sources":{"Attributes":{"data":{"_7":"4camping - objedn\u00e1vky","_2":"4camping.cz","_25":"Caravaning Brno 2017","_3":"Dokempu.cz","_11":"Dopenzionu.cz","_24":"Festival Obzory 2017","_15":"For Caravan 2016","_4":"Golfova-hriste.cz - hlasujici v ankete","_5":"Golfova-hriste.cz - registrovani uzivatele","_14":"Holiday World 2016","_20":"Holiday World 2017","_23":"Holiday World 2018","_8":"Jin\u00e9","_16":"Lod\u011b na vod\u011b 2016","_27":"Obzory 2018","_13":"Region Tour 2016","_19":"Region Tour 2017","_22":"Region Tour 2018","_12":"Sport Life 2015","_18":"Sport Life 2016","_9":"Veletrhy","_1":"V\u00fdstava Stan\u016f","_6":"V\u00fdstava Stan\u016f 2014","_10":"V\u00fdstava stan\u016f 2015","_17":"V\u00fdstava stan\u016f 2016","_21":"V\u00fdstava stan\u016f 2017","_26":"V\u00fdstava stan\u016f 2018","_0":"---"},"id":"sources","className":"form-control"},"Label":"Zdroj","Method":"addSelect","Tag":"select"},"groups":{"Attributes":{"data":{"_1":"Sout\u011b\u017e\u00edc\u00ed 2015","_2":"U\u017eivatel\u00e9 Ubytovac\u00edch port\u00e1l\u016f","_3":"Z\u00e1kazn\u00edci 4camping.cz","_4":"Provozovatel\u00e9 kemp\u016f a RS","_5":"Provozovatel\u00e9 penzion\u016f","_6":"Testovac\u00ed skupina","_7":"Nakupuj\u00edc\u00ed od 1.6.2015 do 17.12.2015","_8":"Sout\u011b\u017e\u00edc\u00ed 2016","_9":"U\u017eivatel\u00e9 seznam.cz","_10":"Nejsou seznam.cz","_13":"Praha a St\u0159edo\u010desk\u00fd kraj","_14":"100K\u010d za email","_15":"Slovensko","_16":"\u010cR","_17":"Plzen","_18":"Skupina 1","_19":"Skupina 2","_20":"Korekto\u0159i","_21":"Sout\u011b\u017e\u00edc\u00ed 2017","_22":"V\u00fdstava stan\u016f","_23":"Sout\u011b\u017e\u00edc\u00ed VS 2017","_24":"\u017deny","_25":"Sout\u011b\u017e\u00edc\u00ed 2018","_0":"---"},"id":"groups","className":"form-control"},"Label":"Skupina","Method":"addSelect","Tag":"select"},"languages":{"Attributes":{"data":{"_1":"\u010desky","_2":"slovensky","_0":"---"},"id":"languages","className":"form-control"},"Label":"Jazyk","Method":"addSelect","Tag":"select"},"categories1":{"Attributes":{"class":"form-control","type":"checkbox","id":"categories1","className":"form-control"},"Label":"Nab\u00eddky eshopu 4camping.cz","Method":"addCheckbox","Tag":"input"},"categories2":{"Attributes":{"class":"form-control","type":"checkbox","id":"categories2","className":"form-control"},"Label":"Newsletter Golfov\u00e1-h\u0159i\u0161t\u011b.cz","Method":"addCheckbox","Tag":"input"},"categories6":{"Attributes":{"class":"form-control","type":"checkbox","id":"categories6","className":"form-control"},"Label":"Informace o sout\u011b\u017e\u00edch","Method":"addCheckbox","Tag":"input"},"categories7":{"Attributes":{"class":"form-control","type":"checkbox","id":"categories7","className":"form-control"},"Label":"Informace o slev\u00e1ch","Method":"addCheckbox","Tag":"input"},"categories8":{"Attributes":{"class":"form-control","type":"checkbox","id":"categories8","className":"form-control"},"Label":"Novinky port\u00e1l\u016f","Method":"addCheckbox","Tag":"input"},"categories10":{"Attributes":{"class":"form-control","type":"checkbox","id":"categories10","className":"form-control"},"Label":"Novinky a informace pro provozovatele","Method":"addCheckbox","Tag":"input"},"_import":{"Attributes":{"id":"_import","className":"form-control"},"Label":"P\u0159et\u00e1hn\u011bte V\u00e1\u0161 soubor sem nebo klikn\u011bte dvakr\u00e1t pro v\u00fdb\u011br souboru na disku.","Method":"addUpload","Tag":"input"},"_submit":{"Attributes":{"className":"btn btn-success","onClick":"submit","type":"submit","id":"_submit"},"Label":"Nahr\u00e1t soubor","Method":"addSubmit","Tag":"input"},"_prepare":{"Attributes":{"className":"btn btn-success","onClick":"prepare","style":{"display":"none"},"id":"_prepare"},"Label":"Po\u010dkejte doku\u010f import neskon\u010d\u00ed.","Method":"addMessage","Tag":"div"},"_done":{"Attributes":{"style":{"display":"none"},"id":"_done","className":"form-control"},"Label":"V\u00e1\u0161 soubor byl nahran\u00fd.","Method":"addMessage","Tag":"div"}},"validators":[]}';
        element.setAttribute('data', data)
        expect(typeof(document)).toEqual(typeof(element))
        expect(element.id).toEqual('importForm')
        document.body.insertBefore(element, document.getElementById('head'))
        var dom = ReactDOM.render(<ImportForm />, document.getElementById(element.id))
        var doms = dom.attached()
        expect(doms[0].key).toEqual('_prepare-progress')
        expect(typeof(dom.state.row['_prepare-progress'])).toEqual('object')
        var json = JSON.parse(document.querySelector('#importForm').getAttribute('data'))
        expect(typeof(json)).toEqual('object')
        expect(json.row._done.Attributes.id).toEqual('_done')
    });
});