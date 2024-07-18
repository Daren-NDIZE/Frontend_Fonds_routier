import SideBar from "./sideBar";
import Header from "./header";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { fetchGet } from "../config/FetchRequest";


const Model=forwardRef(function ({children},ref){

    let [user,setUser]=useState({})

    useImperativeHandle(ref, ()=>({'updateUser': setUser}))


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
          })()
    },[])
    
    return(
        <>
            <div className="left-content">
                <SideBar role={user.role}/>
            </div>
            <div className="right-content">
                <Header user={user}/>
                {children}
            </div>
        </>  
    )
    
})

export default Model;