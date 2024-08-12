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

    let notification=useRef()
    let modalBox=useRef()
    let userList=useRef()

    const navigate=useNavigate()

    useEffect(()=>{

        (async function (){

            try{
                let res = await fetchGet(`getAllUser`)

                let response = await fetchGet(`role/getAllRole`)

                if(res.ok){
                    let resData= await res.json()
                    setUsers(resData)
                    userList.current=resData
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
                        setUsers(dataRes)
                        userList.current=dataRes
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
                    <SearchBar/>
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
                                <th>N°</th>
                                <th>Nom</th>
                                <th>Prénom</th>
                                <th>Username</th>
                                <th>Role</th>
                                <th>Email</th>
                                <th>Téléphone</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((i,j)=>
                            <tr key={j}>
                                <td>{j+1}</td>
                                <td>{i.nom}</td>
                                <td>{i.prenom}</td>
                                <td>{i.username}</td>
                                <td>{i.role.roleName}</td>
                                <td>{i.email}</td>
                                <td>{i.telephone}</td>
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
                    </div>

                    <div>
                        <div className="form-line">
                            <label>Role</label>
                            <select name="roleName" required> 
                                <option value="">- - - - - - - - - - - - - - - - - - - - - - - </option>
                                {roles.map((i,k)=>
                                    <option value={i.roleName} key={k}>{i.roleName}</option>
                                )}
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

            {pageLoader &&(
                <PageLoader/>
            )}
        </div>
    )
}


export default UserList;