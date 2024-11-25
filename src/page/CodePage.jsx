import { useState,useRef, useEffect} from "react"
import { LoginFetch } from "../config/FetchRequest";
import Loader from "../component/loader";
import { useNavigate, useParams } from "react-router-dom";
import { dechiffrement } from "../config/crypto";
import Notification from "../component/notification";


function CodePage(){
    

    let [loading,setLoading]=useState(false)
    let [loader,setLoader]=useState(true)
    let notification=useRef()

    const navigate=useNavigate()
    
    const {id}=useParams()


    useEffect(()=>{


        let username=dechiffrement(id)

        if(!username){
            navigate("/login")
        }
    
        setLoader(false)

    },[id,navigate])

    const submit=async(e)=>{

        e.preventDefault()

        if(isNaN(e.target.code.value)  || e.target.code.value.length!==6){
            
            notification.current.setNotification(
                {visible: true, type:"erreur", message:"Code incorrect"}
            )
        }
        setLoading(true)

        let formData =new FormData(e.target);
        formData.append("username",dechiffrement(id))
        let data=Object.fromEntries(formData)

        try{
            const res= await LoginFetch("verifyCode","POST",data)

            if(res.ok){
                let resData= await res.json()
                
                if(resData.authenticate){
                    localStorage.setItem("token",resData.token)
                    window.location.href="/acceuil"
                }
                else{
                    notification.current.setNotification(
                        {visible: true, type:"erreur",message:resData.token}
                    )
                }
            }else if(res.status===403){

                navigate("/login")
            }

           
        }catch(e){
            console.log(e)
        }finally{

            setLoading(false)
        }
    }

    const limiteValue=(e)=>{

        let value=e.target.value;

        if(value.length >6){

            e.target.value=value.substring(0,6)
        }
    }
   

    if(loader){
        return(
            <div className="vf-loadBox">
                <Loader/>
            </div>
        )
    }

    return(
        <div className="v-container">

            <div className="l-top">
                <img src="/logo.png" alt="error"/>
            </div>

            <div className="v-formBox">

                <Notification ref={notification} />

                <form method="post" onSubmit={submit} >
                    <div className="form-line vf">
                        <label>Enter votre code de verification à 6 chiffres</label>
                        <input type="number" name="code"  required onInput={limiteValue}/>
                    </div>
                    
                    <div className="v-line">
                        <button type="button" onClick={()=>navigate("/login")}>Retour</button>
                        {loading?
                            <button type="button" className="load-button"><span className="loader"></span></button>:
                            <button type="submit">Confirmer</button>
                        }
                    </div>
                </form>
                    
            </div>
        
        </div>
    )
}


export default CodePage;