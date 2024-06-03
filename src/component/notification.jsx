import { useState,forwardRef,useImperativeHandle} from "react"


const Notification=forwardRef( function (props,ref){

    let [data,setData]=useState({visible: false, type:"" ,message:""})

    const setNotification=(data)=>{
        setData(data)
        window.setTimeout(()=>{
            setData({visible: false, type:"" ,message:""})
        },5000)
    }

    const handleClick=()=>{
        setData({visible: false, type:"" ,message:""})
    }

    useImperativeHandle(ref, ()=>({'setNotification': setNotification}))


    return(
        <>
            {data.visible&&
            (
                <div className={"notification "+data.type}>
                    <p>{data.message}</p>
                    <i className="fa-solid fa-xmark" onClick={handleClick}></i>
                </div>
            )          
            }
        </>
    )
})

export default Notification;