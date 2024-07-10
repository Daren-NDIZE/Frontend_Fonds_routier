import { useEffect, useRef, useState } from "react";
import {NumberToLetter} from "../../script";
import {  Fetch, fetchGet } from "../../config/FetchRequest";
import Notification from "../../component/notification";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../../component/loader";


function UpdatePg(){

    const [number,setNumber]=useState("")
    const [programme,setProgramme]=useState({})
    let [loader,setLoader]=useState(true)
    let [loading,setLoading]=useState(false)

    const {id}=useParams()
    const navigate=useNavigate()

    let notification=useRef()

    const convertir=(e)=>{
        setNumber(NumberToLetter(e.target.value)) 
    }


    useEffect(()=>{

        (async function(){

            if(isNaN(id)){
                navigate(-1)
                return;
            }
            try{
                const res= await fetchGet(`programmeByRole/${id}`);
                if(res.ok){
                    let resData = await res.json()
                    if(resData.type==="erreur"){
                        navigate(-1)
                    }else{
                        setProgramme(resData)
                        setNumber(NumberToLetter(resData.budget))
                    }
                    
                }
            }catch(e){
                console.log(e)

            }finally{
                setLoader(false)
            }
        })()

    },[navigate,id])

    const submit=async(e)=>{

        e.preventDefault()

        if(e.target.type.value===""  || e.target.budget.value===""){
            return;
        }
        
        let formData =new FormData(e.target);
        let data=Object.fromEntries(formData)

        setLoading(true)
        try{
            const res= await Fetch(`updateProgramme/${id}`,"PUT",data)

            if(res.ok){
                let resData= await res.json()

                notification.current.setNotification(
                    {visible: true, type:resData.type,message:resData.message}
                )

                window.setTimeout(()=>{
                    navigate("/programmes")
                },2000)
                
            }
           
        }catch(e){
            console.log(e)
        }finally{
            setLoading(false)
        }
    }

    if(loader){
        return(
            <Loader/>
        )
    }

    return(

        <div className="container">
            <Notification ref={notification} />
            <div className="box b-pg">
                <div>
                    <h1>MODIFIER UN PROGRAMME</h1>
                </div>
                <form method="post" onSubmit={submit}>
                    <div className="form-line">
                        <label>Programme</label>
                        <select name="type" defaultValue={programme.type} required>
                            <option value="">- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - </option>
                            <option value="BASE">{`Programme ${programme.ordonnateur} ${programme.annee}`}</option>
                            <option value="ADDITIONNEL">{`Programme additionnel ${programme.ordonnateur} ${programme.annee}`}</option>
                        </select>
                    </div>
                    <div className="form-line">
                        <label>Budget total (fcfa)</label>
                        <input type="number" name="budget" onChange={convertir} defaultValue={programme.budget} required/>
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

export default UpdatePg;