import { useState,useRef, useEffect} from "react"
import { LoginFetch } from "../config/FetchRequest";
import Notification from "../component/notification";
import { useNavigate } from "react-router-dom";
import { chiffrement } from "../config/crypto";


function Login(){
    

    let [loading,setLoading]=useState(false)
    let notification=useRef()

    const navigate=useNavigate()


    const submit=async(e)=>{

        e.preventDefault()

        if(e.target.username.value==="" || e.target.password.value===""){
            return;
        }
        setLoading(true)

        let formData =new FormData(e.target);
        let data=Object.fromEntries(formData)

        try{
            const res= await LoginFetch("login","POST",data)

            if(res.ok){
                let resData= await res.json()
                
                if(resData.authenticate){
                    localStorage.setItem("token",resData.token)
                    window.location.href="/acceuil"
                }
                else{
                    notification.current.setNotification(
                        {visible: true, type:"erreur",message:"vos identifiants sont incorrects"}
                    )
                }


            }else if(res.status===300){

                let resData= await res.json()

                navigate(`/verification/${chiffrement(resData.username)}`);
            }

           
        }catch(e){
            console.log(e)
        }finally{

            setLoading(false)
        }
    }
   

    return(
        <div className="login-container">

            <div className="l-top">
                <img src="/logo.png" alt="error"/>
                <h1>Connectez-vous à PROGMA FR</h1>
            </div>

            <Notification ref={notification} />

            <div className="l-form-box">

                <form method="post" onSubmit={submit} >
                    <div className="form-line fl">
                        <label>Nom d'utilisateur</label>
                        <input type="text" name="username" required/>
                    </div>
                    <div className="form-line fl">
                        <label>mot de passe</label>
                        <input type="password" name="password" required />
                    </div>
                    <div className="form-line fl">
                        {loading?
                            <button type="button" className="load-button"><span className="loader"></span></button>:
                            <button type="submit">Connexion</button>
                        }
                    </div>
                </form>
                    
            </div>
        
        </div>
    )
}


export default Login;