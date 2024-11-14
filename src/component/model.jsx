import SideBar from "./sideBar";

import Header from "./header";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { fetchGet } from "../config/FetchRequest";


const Model=forwardRef(function ({children},ref){

    let [user,setUser]=useState({role:{}})

    useImperativeHandle(ref, ()=>({'updateUser': setUser}))

    const slideBar=()=>{

        let left=document.querySelector(".left-content")
        left.classList.toggle("view")
    }

    useEffect(()=>{

        (async function(){

            try{
                const res= await fetchGet('profil')
                if(res.ok){
                    const resData= await res.json()
                    setUser(resData)
                }
      
            }catch(e){
                console.log(e)
            }
          })();
    },[])
    
    return(
        <> 
            <div className="left-content">
                <SideBar role={user.role.roleName}/>
                <div className="x-close">
                    <i className="fa-solid fa-xmark" onClick={slideBar}></i>
                </div>
            </div>
            <div className="right-content" >
                <Header user={user} onSlideBar={slideBar}/>
                {children}
            </div>
        </>  
    )
    
})

export default Model;
