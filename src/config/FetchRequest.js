
export const fetchGet= async (url)=>{

    const res= await fetch(`${process.env.REACT_APP_DOMAINE}/${url}`,{
        method: 'GET',
        headers: {
            'Authorization':"Bearer "+localStorage.getItem("token"),
            'Accept':'application/json',
        }            
    })

    if(res.status===400 || res.status===500 ){
        alert("bad request")
    }
    else if(res.status===401){

        localStorage.clear()
        window.location.href="/login"

    }
    else if(res.status===403){

        window.history.back()

    }

    return res;
    
}




////////////////////////////////////////////////////////////////

export const LoginFetch= async (url,method,body)=>{

    const res= await fetch(`${process.env.REACT_APP_DOMAINE}/${url}`,{
        method: method,
        headers: {
            'Content-Type':'application/json',
            'Accept':'application/json',

        },
        body: JSON.stringify(body) ,          
    })


    return res

}

///////////////////////////////////

export const Fetch=async (url,method,body)=>{

    const res= await fetch(`${process.env.REACT_APP_DOMAINE}/${url}`,{
        method: method,
        headers: {
            'Authorization':"Bearer "+localStorage.getItem("token"),
            'Accept':'application/json',
            'Content-Type':'application/json'
        },

        body: JSON.stringify(body) ,          
    })

    if(res.status===400 || res.status===500 ){
        alert("bad request")
    }
    else if(res.status===401){

        localStorage.clear()
        window.location.href="/login"

    }
    else if(res.status===403){

        window.history.back()

    }

    return res;

    
}



export const fetchFormData=async (url,method,body)=>{


    const res= await fetch(`${process.env.REACT_APP_DOMAINE}/${url}`,{
        method: method,
        headers: {
            'Authorization':"Bearer "+localStorage.getItem("token"),
        },

        body: body ,          
    })

    if(res.status===400 || res.status===500 ){
        alert("bad request")
    }
    else if(res.status===401){

        localStorage.clear()
        window.location.href="/login"

    }
    else if(res.status===403){

        window.history.back()

    }

    return res;

    
}