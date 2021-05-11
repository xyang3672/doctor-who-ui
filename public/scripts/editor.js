const baseURL = 'http://localhost:8081';

const initResetButton = () => {
    // if you want to reset your DB data, click this button:
    document.querySelector('#reset').onclick = ev => {
        fetch(`${baseURL}/reset/`)
            .then(response => response.json())
            .then(data => {
                console.log('reset:', data);
            });
    };
};

const attachEventHandlers = () => {
    // once the unordered list has been attached to the DOM
    // (by assigning the #artists container's innerHTML),
    // you can attach event handlers to the DOM:
    document.querySelectorAll('#doctors a').forEach(a => {
        a.onclick = showDetail;
    });
};    

let doctors; 
const getDoctor = () => {
fetch('/doctors')
    .then(response => response.json())
    .then(data => {
        // store the retrieved data in a global variable called "artists"
        doctors = data;
        const listItems = data.map(item => `
            <li id='${item._id}'>
                <a href="#" data-id="${item._id}">${item.name}</a>
            </li>`
        );
        document.getElementById('doctors').innerHTML = `
            <ol id='docList'>
                ${listItems.join('')}
            </ol>`
    })
    .then(attachEventHandlers);
}

getDoctor();

// fetch the companions of currentTarget doctor
const getCompanions = id => {
    fetch(`/doctors/${id}/companions`)
    .then(response => response.json())
    .then(data => {
        companions = data;
        const listItems = data.map(item => `
            <tr>
                <td><img src="${item.image_url}" width='55' height='70'/></td>
                <td id='text'><p data-id="${item._id}">${item.name}</p></td>
            </tr>`
        );
        document.getElementById('companions').innerHTML = `
            <h2> Companions </h2>
            <table>
                ${listItems.join('')}
            </table>`
    })
}

const showDoctor = doctor => {
    document.querySelector('#doctor').innerHTML = `
        <h2>${doctor.name} 
            <span style='font-size:16px;font-weight:normal;float:right;'>
                <a href='#' id='edit'>Edit</a> 
                <a href='#' id='delete'>Delete</a>
            <span>
        </h2>
        <img src="${doctor.image_url}" alt="doctor's image" width="320" height="500" />
        <p>Seasons: ${doctor.seasons}</p>
    `;
}

const showDetail = ev => {
    const id = ev.currentTarget.dataset.id;
    const doctor = doctors.filter(doctor => doctor._id === id)[0];
    console.log(doctor);
    // append the doctor template to the DOM:
    showDoctor(doctor);
    getCompanions(id);  
    edit(doctor, id);
}


    // edit form
const edit = (doctor,id) =>  {
    document.getElementById('edit').addEventListener('click', function() {
            document.getElementById("doctor").innerHTML = `
            <div id='error'> </div>
            <form id="update-form">
                <!-- Name -->
                <p>
                <label for="name">Name</label>
                <input type="text" id="name" value="${doctor.name}">
                </p>
                <!-- Seasons -->
                <p>
                <label for="seasons">Seasons</label>
                <input type="text" id="seasons" value="${doctor.seasons}">
                </p>
                <!-- Ordering -->
                <p>
                <label for="ordering">Ordering</label>
                <input type="text" id="ordering" value="${doctor.ordering}">
                </p>
                <!-- Image -->
                <p>
                <label for="image_url">Image</label>
                <input type="text" id="image_url" value="${doctor.image_url}">
                </p>
                <!-- Buttons -->
                <p>
                <button class="btn btn-main" id="update">Update</button>
                <button class="btn" id="cancel-update">Cancel</button>
                </p>    
            </form>
        `
        document.getElementById("companions").innerHTML = ` ` 
       
        const cancel = () => {
            showDoctor(doctor);
            getDoctor();
            getCompanions(id);
            edit(doctor, id);
        }

        document.getElementById('cancel-update').addEventListener('click', cancel);
        
        const patchDoctor = data => {
            fetch(`/doctors/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if (!response.ok) {
                    // send to catch block:
                    throw Error(response.statusText);
                } else {
                    return response.json();
                }
            })
            .then(data => {
                console.log(data);
                showDoctor(data);
                getDoctor();
                getCompanions(data._id);
                edit(data, data._id);
            })
            .catch(err => {
                console.error(err);
                alert('Error!');
            });
        }

        const update = ev => {
                ev.preventDefault()
                const errorElement = document.getElementById('error')
                const DocName = document.getElementById('name').value
                const seasons = document.getElementById('seasons').value.split(',')
                const ordering = document.getElementById('ordering').value
                const image_url = document.getElementById('image_url').value
                let valid = true
                if (DocName == '') {
                    errorElement.innerText = 'Name is required';
                    return valid = false
                }
                seasons.forEach(element => {
                    if (isNaN(element)) {
                        errorElement.innerText = 'Pleae enter the correct seasons';
                        return valid = false
                    }
                })
                const data = {
                    name: DocName,
                    seasons: seasons,
                    ordering: ordering,
                    image_url: image_url
                }
                if (valid) patchDoctor(data)
        }
        document.getElementById('update').addEventListener('click', update);
        
    })   

        const Delete = ev => {
            const url = `/doctors/${id}`;
            const r = confirm(`Are you sure you want to delete ${doctor.name}?`)
            if (r === true) {
                fetch(url, {
                        method: 'DELETE'
                    })
                    .then(response => {
                        if (!response.ok) {
                            // send to catch block:
                            throw Error(response.statusText);
                        } else {
                            // because the endpoint returns a 
                            // null value, use the text() method
                            // instead of the .json() method:
                            return response.text();
                        }
                    })
                    .then(data => {
                        console.log(data);
                        getDoctor();
                        document.getElementById("doctor").innerHTML = ` `;
                        document.getElementById("companions").innerHTML = ` `;
                    })
                    .catch(err => {
                        console.error(err);
                        alert('Error!');
                    });
                } else {
                    return
                }
            ev.preventDefault();
        }
        document.getElementById('delete').addEventListener('click', Delete)
    }

const postDoctor = data => {
    fetch('/doctors', {
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw Error(response.statusText)
            } else {
                return response.json()
            }
        })
        .then(data => {
            console.log(data);
            showDoctor(data);
            getDoctor();
            getCompanions(data._id)
            edit(data,data._id)
        })
        .catch(err => {
            alert('Error!')
        })
}

document.getElementById("add").addEventListener("click", function() {
    document.getElementById("doctor").innerHTML = `
        <div id='error'></div>
        <form id="add-form" action="/" method="GET">
            <!-- Name -->
            <div>
            <label for="name">Name</label>
            <input type="text" id="name" >
            </div>
            <!-- Seasons -->
            <div>
            <label for="seasons">Seasons</label>
            <input type="text" id="seasons" >
            </div>
            <!-- Ordering -->
            <div>
            <label for="ordering">Ordering</label>
            <input type="text" id="ordering" >
            </div>
            <!-- Image -->
            <div>
            <label for="image_url">Image</label>
            <input type="text" id="image_url" >
            </div>
            <!-- Buttons -->
            <div>
            <button class="btn btn-main" id="create">Save</button>
            <button class="btn" id="cancel">Cancel</button>
            </div>    
        </form>
    `
    document.getElementById("companions").innerHTML = ` `
    
    document.getElementById('cancel').addEventListener('click', ev => {
        ev.preventDefault();
        document.getElementById("add-form").innerHTML = ''
    })


    // send to database 
    const create = ev => {
        ev.preventDefault()
        const errorElement = document.getElementById('error')
        const DocName = document.getElementById('name').value
        const seasons = document.getElementById('seasons').value.split(',')
        const ordering = document.getElementById('ordering').value
        const image_url = document.getElementById('image_url').value
        let valid = true
        if (DocName == '') {
            errorElement.innerText = 'Name is required';
            return valid = false
        }
        seasons.forEach(element => {
            if (isNaN(element)) {
                errorElement.innerText = 'Pleae enter the correct seasons';
                return valid = false
            }
        })
        const data = {
            name: DocName,
            seasons: seasons,
            ordering: ordering,
            image_url: image_url
        }
        if (valid) postDoctor(data)
        
        
    }

    document.getElementById('create').addEventListener('click', create)
    
})

 
// invoke this function when the page loads:
initResetButton();