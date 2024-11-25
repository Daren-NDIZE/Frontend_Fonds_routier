import { useEffect, useRef, useState } from "react"
import SearchBar from "../../component/searchBar"
import Loader from "../../component/loader"
import { Fetch, fetchGet } from "../../config/FetchRequest"
import Notification from "../../component/notification"
import ModalBox from "../../component/modalBox"
import PageLoader from "../../component/pageLoader"
import { useNavigate } from "react-router-dom"


function UserList(){

    let [users,setUsers]=useState([])
    let [roles,setRoles]=useState([])
    let [loader,setLoader]=useState(true)
    let [erreur,setErreur]=useState("")
    let [pageLoader,setPageLoader]=useState()
    let [check,setCheck]=useState()
    let [userId,setUserId]=useState()

    let notification=useRef()
    let modalBox=useRef()
    let modal1=useRef()
    let modal2=useRef()
    let userList=useRef()

    const navigate=useNavigate()

    useEffect(()=>{

        (async function (){

            try{
                let res = await fetchGet(`getAllUser`)

                let response = await fetchGet(`role/getAllRole`)

                if(res.ok){
                    let resData= await res.json()
                    userList.current=resData
                    setUsers(resData)
                }
                if(response.ok){
                    let resData= await response.json()
                    setRoles(resData)
                }
            }catch(e){
                console.log(e)
            }finally{
                setLoader(false)
            }

        })()

    },[])

    const createUser=async (e)=>{

        e.preventDefault()
        let form=e.target

        if(erreur.length!==0){
            setErreur("")
        }
    
        if(form.nom.value==="" || form.prenom.value==="" || form.email.value==="" || form.telephone.value===""
        || form.username.value==="" || form.roleName.value==="")
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
            let res= await Fetch("createUser","POST",data)
            if(res.ok){

                let resData= await res.json()
                
                if(resData.type==="succes"){

                    let response = await fetchGet(`getAllUser`)
   
                    if(response.ok){
                        let dataRes= await response.json()
                        userList.current=dataRes
                        setUsers(dataRes)
                    }
                }

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

    const deleteUser=async (e)=>{

        setPageLoader(true)
        modal1.current.setModal(false)

        try{
            let res= await Fetch(`deleteUser/${userId}`,"DELETE")
            if(res.ok){
                let resData= await res.json()
                
                if(resData.type==="succes"){
                    let data= users.filter(i=>i.id!==userId)
                    userList.current= userList.current.filter(i=>i.id!==userId)
                    setUsers(data)
                }

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

    const resetPassword=async (e)=>{

        setPageLoader(true)
        modal2.current.setModal(false)

        try{
            let res= await Fetch(`resetPassword/${userId}`,"PUT")
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

    const openBox=(id,modal)=>{
        setUserId(id)
        modal.current.setModal(true)
    }

    if(loader){
        return(
            <Loader/>
        )
    }

    return(
        <div className="container">

            <Notification ref={notification} />

            <div className="flex">
                <div className="retour-container">
                    <button className="retour-btn" onClick={()=>navigate(-1)}>
                        <i className="fa-solid fa-arrow-left"></i>
                         Retour
                    </button>
                </div>
                <div className="box b-search">
                    <SearchBar data={userList.current} keys={["nom","prenom","username"]} onSetData={setUsers}/>
                </div>
            </div>

            <div className="box">
                <div id="pg-title" className="suivi-pg">
                    <div>
                        <h1>Liste des utilisateurs</h1>
                    </div>
                    <div className="n-projet" onClick={()=>modalBox.current.setModal(true)}>
                        <button>Nouvel utilisateur</button>
                    </div>
                </div>
                <div className="tableBox">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>
                                    <input type="checkbox" onChange={(e)=>setCheck(e.target.checked)}/> N°
                                </th>
                                <th className="min-w4">Nom</th>
                                <th className="min-w4">Prénom</th>
                                <th className="min-w4">Username</th>
                                <th className="min-w4">Administration</th>
                                <th>Role</th>
                                <th className="min-w4">Email</th>
                                <th className="min-w4">Téléphone</th>
                                {check &&(
                                    <th width="50px"></th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((i,j)=>
                            <tr key={j}>
                                <td>{j+1}</td>
                                <td>{i.nom}</td>
                                <td>{i.prenom}</td>
                                <td>{i.username}</td>
                                <td>{i.administration}</td>
                                <td>{i.role.roleName}</td>
                                <td>{i.email}</td>
                                <td>{i.telephone}</td>
                                {check &&(
                                    <td>
                                        <div className="t-action">
                                            <i className="fa-solid fa-key" onClick={()=>openBox(i.id,modal2)}></i>
                                            <i className="fa-solid fa-trash-can" onClick={()=>openBox(i.id,modal1)} ></i>
                                        </div>
                                    </td>
                                )}
                            </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ModalBox ref={modalBox} >

                <form className="flex-form" onSubmit={createUser} >
                    
                    <div>   
                        {erreur.length!==0 &&(
                            <p className="error-msg">{erreur}</p>
                        )}
                        <div className="form-line">
                            <label>Nom</label>
                            <input type="text"  name="nom" required/>
                        </div>
                        <div className="form-line">
                            <label>Prenom</label>
                            <input type="text" name="prenom" required/>
                        </div>
                        <div className="form-line">
                            <label>Username</label>
                            <input type="text" name="username" required/>
                        </div>
                        <div className="form-line">
                            <label>Role</label>
                            <select name="roleName" required> 
                                <option value="">- - - - - - - - - - - - - - - - - - - - - - - </option>
                                {roles.map((i,k)=>
                                    <option value={i.roleName} key={k}>{i.roleName}</option>
                                )}
                            </select>
                        </div>
                    </div>
                    

                    <div>
                        <div className="form-line">
                            <label>Administration</label>
                            <select name="administration" required> 
                                <option value="">- - - - - - - - - - - - - - - - - - - - - - - </option>
                                <option value="FR">Fonds routier</option>
                                <option value="MINTP">MINTP</option>
                                <option value="MINHDU">MINHDU</option>
                                <option value="MINT">MINT</option>
                            </select>
                        </div>
                        <div className="form-line">
                            <label>Email</label>
                            <input type="text" name="email" required/>
                        </div>
                        <div className="form-line">
                            <label>Téléphone</label>
                            <input type="number"  name="telephone" required/>
                        </div>
                        <div className="form-line" style={{margin: "0"}}>
                            <button type="submit">Enregistrer</button>
                        </div>

                    </div>     
                </form>

            </ModalBox>

            <ModalBox ref={modal1}>
                <div className="pg-modal">
                    <p>Voulez vous vraiment supprimer cet utilisateur?</p>
                    <div className="mb-content">
                        <button className="s-btn" onClick={deleteUser}>OUI</button>
                        <button className="b-btn" onClick={()=>{modal1.current.setModal(false)}}>NON</button>
                    </div>
                </div>
            </ModalBox>

            <ModalBox ref={modal2}>
                <div className="pg-modal">
                    <p>Voulez vous vraiment réinitialiser le mot de passe de cet utilisateur?</p>
                    <div className="mb-content">
                        <button className="s-btn" onClick={resetPassword}>OUI</button>
                        <button className="b-btn" onClick={()=>{modal2.current.setModal(false)}}>NON</button>
                    </div>
                </div>
            </ModalBox>

            {pageLoader &&(
                <PageLoader/>
            )}
        </div>
    )
}


export default UserList;