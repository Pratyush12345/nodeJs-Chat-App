const socket=io()

//Elements
const $messageForm=document.querySelector('#message-form')
const $messageFormInput=$messageForm.querySelector('input')
const $messageFormButton=$messageForm.querySelector('button')
const $sendLocationButton=document.querySelector('#send-location')
const $messages=document.querySelector('#messages') //messages

//Templates
const $messageTemplate=document.querySelector('#message-template').innerHTML //messagetemplate
const $locationMessageTemplate=document.querySelector('#location-message-template').innerHTML//locationmessagetemplate
const $sidebarTemplate=document.querySelector('#sidebar-template').innerHTML
//options
const { username, room } = Qs.parse(location.search,{ignoreQueryPrefix: true})

const autoscroll=()=>{
    //new message element
    const $newMessage=$messages.lastElementChild

    //Height of the new message
    const newMessageStyles=getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight+ newMessageMargin

    //console.log(newMessageStyles.marginBottom)
    //visibil height
     const visibleHeight=$messages.offsetHeight

    //Height of messageContainer    
    const containerHeight=$messages.scrollHeight

    //how fai haive i scrolled?
    const scrollOffset=$messages.scrollTop+ visibleHeight

    if((containerHeight - newMessageHeight) <= scrollOffset){
        $messages.scrollTop=$messages.scrollHeight
    }


}

socket.on('message',(message)=>{

    const html=Mustache.render($messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(message)=>{
    const html=Mustache.render($locationMessageTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
     $messages.insertAdjacentHTML('beforeend',html)
     autoscroll()
})

socket.on('roomData',({room,users})=>{
    const html= Mustache.render($sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
    // console.log(room)
    //console.log(users)
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')
    const message=e.target.elements.message.value
    socket.emit('sendMessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=""
        $messageFormInput.focus()

        if(error){
            return console.log(error)
        }
        console.log('Message Delivered!')
    })
})

$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by ur browser')
    }
    $sendLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        //console.log(position)
        socket.emit('sendlocation',{
            'latitude':position.coords.latitude,
            'longitude':position.coords.longitude
        },()=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location Shared!')
        })
    })
})

socket.emit('join',{username, room},(error)=>{
    
    if(error){
        alert(error)
        location.href='/'
    }
})