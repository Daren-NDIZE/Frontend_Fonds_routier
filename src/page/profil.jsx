import { useEffect, useRef, useState } from "react"
import Loader from "../component/loader"
import { Fetch, fetchGet } from "../config/FetchRequest"
import ModalBox from "../component/modalBox"
import PageLoader from "../component/pageLoader"
import Notification from "../component/notification"


function Profil({header}){

    let [user,setUser]=useState({role:{}})
    let [loader,setLoader]=useState(true)
    let [erreur,setErreur]=useState("")
    let [pageLoader,setPageLoader]=useState()

    let modalBox=useRef()
    let modalBox1=useRef()
    let notification=useRef()

    useEffect(()=>{

        (async function(){

            try{
                const res= await fetchGet('profil')
                if(res.ok){
                    const resData= await res.json()
                    setUser(resData)
                }
      
            }catch(e){

                if(e instanceof SyntaxError){
                    localStorage.clear()
                    window.location.href="/login"
                }
                console.log(e)
            }finally{
                setLoader(false)
            }
          })()
    },[])
    
    const openModal=(modal)=>{
        
        setErreur("")
        modal.current.setModal(true)
    }
  
    const update=async (e)=>{

        e.preventDefault()
        let form=e.target

        
        if(form.nom.value==="" || form.prenom.value==="" || form.email.value==="" || form.telephone.value==="")
        {
            setErreur("Veuillez remplir tous les champs")
            return;
        }
        if(form.telephone.value.length!==9 || form.telephone.value.charAt(0)!=="6")
        {
            setErreur("Numéro de téléphone incorrect")
            return;
        }
        let formData =new FormData(form);
        let data=Object.fromEntries(formData)
        modalBox.current.setModal(false)
        setPageLoader(true)

        try{

            let res= await Fetch("updateUser","PUT",data)
            if(res.ok){
                let resData= await res.json()
                window.scroll({top: 0, behavior:"smooth"})
                notification.current.setNotification(
                    {visible: true, type:resData.type,message:resData.message}
                )

                if(resData.type==="succes"){
                    data.role=user.role
                    data.username=user.username
                    setUser(data)
                    header.current.updateUser(data)
                }
            }

        }catch(e){
            console.log(e)
        }finally{
            setPageLoader(false)
        }

    }

    const updatePassword = async(e)=>{

        e.preventDefault()
        let form=e.target

        if(form.password.value==="" || form.newPassword.value==="" || form.confirmPassword.value==="" )
        {
            setErreur("Veuillez remplir tous les champs")
            return;
        }
        if( form.newPassword.value !== form.confirmPassword.value)
        {
            setErreur("mot de passe de confirmation incorrect")
            return;
        }

        let formData =new FormData(form);
        let data=Object.fromEntries(formData)
        modalBox1.current.setModal(false)
        setPageLoader(true)

        try{

            let res= await Fetch("updatePassword","PUT",data)
            if(res.ok){
                let resData= await res.json()
                window.scroll({top: 0, behavior:"smooth"})
                notification.current.setNotification(
                    {visible: true, type:resData.type,message:resData.message}
                )

            }

        }catch(e){
            console.log(e)
        }finally{
            setPageLoader(false)
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

            <div className="box profil">
                <div>
                    <img src="/patrie.jpg" alt="error"/>
                </div>
                <hr/>
                <div>
                    <div className="profil-line">
                        <div>Nom :</div>
                        <div>{user.nom}</div>
                    </div>
                    <hr/>
                    <div className="profil-line">
                        <div>Prénom :</div>
                        <div>{user.prenom}</div>
                    </div>
                    <hr/>
                    <div className="profil-line">
                        <div>Username :</div>
                        <div>{user.username}</div>
                    </div>
                    <hr/>
                    <div className="profil-line">
                        <div>Email :</div>
                        <div>{user.email}</div>
                    </div>
                    <hr/>
                    <div className="profil-line">
                        <div>Téléphone :</div>
                        <div>{user.telephone}</div>
                    </div>
                    <hr/>
                    <div className="profil-line">
                        <div>Role :</div>
                        <div>{user.role.roleName}</div>
                    </div>
                </div>
            </div>

            <div className="box p-update">
                <button className="fr-btn" onClick={()=>{openModal(modalBox)}}>Modifier Profil</button>
                <button className="fr-btn" onClick={()=>{openModal(modalBox1)}}>Modifier mot de passe</button>
            </div>

            <ModalBox ref={modalBox} >
                <form className="flex-form" onSubmit={update} >
                    
                    <div>
                        
                        {erreur.length!==0 &&(
                            <p className="error-msg">{erreur}</p>
                        )}
                        <div className="form-line">
                            <label>Nom</label>
                            <input type="text"  name="nom" defaultValue={user.nom} required/>
                        </div>
                        <div className="form-line">
                            <label>Prenom</label>
                            <input type="text" name="prenom" defaultValue={user.prenom} required/>
                        </div>
                        <div className="form-line">
                            <label>Email</label>
                            <input type="text" name="email" defaultValue={user.email}  required/>
                        </div>
                        <div className="form-line">
                            <label>Téléphone</label>
                            <input type="number"  name="telephone" defaultValue={user.telephone} required/>
                        </div>
                        <div className="form-line" style={{margin: "0"}}>
                            <button type="submit">Enregistrer</button>
                        </div>
                    </div>     
                </form>
            </ModalBox>

            <ModalBox ref={modalBox1}>
                <form className="flex-form" onSubmit={updatePassword}>
                    <div>
                        {erreur.length!==0 &&(
                            <p className="error-msg">{erreur}</p>
                        )}
                        <div className="form-line">
                            <label>Acien mot de passe</label>
                            <input type="password"  name="password"  required/>
                        </div>
                        <div className="form-line">
                            <label>Nouveau mot de passe</label>
                            <input type="password"  name="newPassword" required/>
                        </div>
                        <div className="form-line">
                            <label>confirmation</label>
                            <input type="password"  name="confirmPassword" required/>
                        </div>
                        <div className="form-line" style={{margin: "0"}}>
                            <button type="submit">Enregistrer</button>
                        </div>
                    </div>
                        
                </form>
            </ModalBox>
            {pageLoader &&(
                <PageLoader/>
            )}
        </div>
    )
}

export default Profil;