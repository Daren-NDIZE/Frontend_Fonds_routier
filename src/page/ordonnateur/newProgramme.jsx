import { useEffect, useRef, useState } from "react";
import {NumberToLetter, decode} from "../../script";
import { Fetch } from "../../config/FetchRequest";
import Notification from "../../component/notification";
import { useNavigate } from "react-router-dom";


function CreatePg(){

    let [number,setNumber]=useState("")
    let user=decode(localStorage.getItem("token"))
    let [loading,setLoading]=useState(false)

    let notification=useRef()

    let navigate=useNavigate()

    let date=new Date()
    let annee=useRef(date.getFullYear()) 

    const convertir=(e)=>{
        setNumber(NumberToLetter(e.target.value)) 
    }


    useEffect(()=>{

        let date=new Date()
        if(date.getMonth()>=11){
            annee.current=date.getFullYear()+1
        }
 
    },[])

    const submit=async(e)=>{

        e.preventDefault()

        if(e.target.type.value==="" || e.target.annee.value==="" || e.target.budget.value===""){
            return;
        }
        
        let formData =new FormData(e.target);
        let data=Object.fromEntries(formData)

        try{
            setLoading(true)
            
            const res= await Fetch("saveProgramme","POST",data)

            if(res.ok){
                let resData= await res.json()

                notification.current.setNotification(
                    {visible: true, type:resData.type,message:resData.message}
                )
                e.target.reset()

                if(resData.type ==="succes"){
                    window.setTimeout(()=>{
                        navigate("/programmes")
                    },2000)
                }

            }
           
        }catch(e){
            console.log(e)
        }finally{
            setLoading(false)
        }
    }


    return(

        <div className="container">
            <Notification ref={notification} />
            <div className="box b-pg">
                <div>
                    <h1>CREER UN PROGRAMME</h1>
                </div>
                <form method="post" onSubmit={submit}>
                    <div className="form-line">
                        <label>Programme</label>
                        <select name="type" required>
                            <option value="">- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - </option>
                            <option value="BASE">{`Programme ${user.role} ${annee.current}`}</option>
                            <option value="ADDITIONNEL">{`Programme additionnel ${user.role} ${annee.current}`}</option>
                        </select>
                        <input type="hidden" name="annee" value={annee.current} />
                    </div>
                    <div className="form-line">
                        <label>Budget total (fcfa)</label>
                        <input type="number" name="budget" onChange={convertir} required/>
                        <p>{number}</p>
                    </div>
                    <div className="form-line">
                    {loading?
                        <button type="button" className="load-button"><span className="loader"></span></button>:
                        <button type="submit">Enregistrer</button>
                    }
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreatePg;