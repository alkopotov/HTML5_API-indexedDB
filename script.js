let db
const dbRequest = indexedDB.open("crudDB", 1);

const keyInput = document.querySelector('.key_input')
const valueInput = document.querySelector('.value_input')
const addButton = document.querySelector('.add_button')
const wrapper = document.querySelector('.wrapper')

const table = document.createElement('table')
table.className = 'table_records'


dbRequest.onupgradeneeded = (e) => {
  db = e.target.result;

  if (!db.objectStoreNames.contains('records')) {
    const recordsStore = db.createObjectStore('records', {keyPath:'keyRecord'})
  }
}

dbRequest.onsuccess = (e) => {
  db = e.target.result;
  console.log("БД успешно открыта", db);
  displayRecords(db)
}

dbRequest.onerror = (e) => {
  console.log('Ошибка' + e.target.errorCode);
}

function addRecord(db, record){
  if (!db) {
    console.log('БД не готова');
    return
  }
  const tx = db.transaction('records', 'readwrite');
  const store = tx.objectStore('records')
  let keyRecord = record.keyRecord
  let valueRecord = record.valueRecord
  let timeRecord = Date.now()
  store.add({keyRecord, valueRecord, timeRecord})
  keyInput.value = ''
  valueInput.value = ''


  tx.oncomplete = () => {
    alert(`Запись ${keyRecord}: ${valueRecord} успешно добавлена`)
    displayRecords(db)
  }

  tx.onerror = (e) => {
    console.log('Ошибка: ', e.srcElement.error.name);
    if (e.srcElement.error.name == 'ConstraintError') {
      alert('Запись с таким ключом уже существует, добавление невозможно, обновите или удалите существующую запись')
    }
  }
}

function updateRecord(db, record){
  if (!db) {
    console.log('БД не готова');
    return
  }
  const tx = db.transaction('records', 'readwrite');
  const store = tx.objectStore('records')
  let keyRecord = record.keyRecord
  let valueRecord = record.valueRecord
  let timeRecord = Date.now()
  store.put({keyRecord, valueRecord, timeRecord})

  tx.oncomplete = () => {
    alert(`Запись с ключом ${keyRecord} успешно обновлена, новое значение - ${valueRecord}`)
    console.log('Запись добавлена');
    displayRecords(db)
  }

  tx.onerror = (e) => {
    console.log('Ошибка: ', e.srcElement.error.name);
  }
}

function deleteRecord(db, key){
  if (!db) {
    console.log('БД не готова');
    return
  }
  const tx = db.transaction('records', 'readwrite');
  const store = tx.objectStore('records')
  store.delete(key)

  tx.oncomplete = () => {
    alert(`Запись c ключом ${key} успешно удалена`)
    console.log('Запись добавлена');
    displayRecords(db)
  }

  tx.onerror = (e) => {
    console.log('Ошибка: ', e.srcElement.error.name);
  }
}

function displayRecords(db){
  const tx = db.transaction('records', 'readonly')
  const store = tx.objectStore('records')
  const req = store.openCursor();
  const allRecords = []

  req.onsuccess = (e) => {
    const cursor = e.target.result;
    
    if(cursor) {
      allRecords.push(cursor.value)
      cursor.continue()
    } else {
      createTable(allRecords)
    }
  }
  req.onerror = (e) => {
    console.error('Ошибка при считывании данных' + e.srcElement.error.name);
  }

}


function createTable(records) {
  if (!records.length) {
    table.remove()
    return
  }
  table.remove()
  table.innerHTML =''
  const header = document.createElement('thead')
  header.innerHTML = `
    <tr>
      <th>Ключ</th>
      <th>Значение</th>
      <th>Модифицирован</th>
      <th>Обновить</th>
      <th>Удалить</th>
    </tr>
  `
  const tbody = document.createElement('tbody')
  records.map(record => {
    const newRow = document.createElement('tr')
    const keyRow = document.createElement('td')
    keyRow.textContent = record.keyRecord
    keyRow.className = 'data_cell'

    const valueRow = document.createElement('td')
    valueRow.contentEditable = true
    valueRow.textContent = record.valueRecord
    valueRow.className = 'data_cell editable'

    const dateTimeRecord = document.createElement('td')
    dateTimeRecord.textContent = getDateTime(record.timeRecord)
    dateTimeRecord.className = 'data_cell'
    
    const updateButton = document.createElement('td')
    updateButton.className = 'table_button'
    updateButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="update_button"><!--! Font Awesome Pro 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M142.9 142.9c62.2-62.2 162.7-62.5 225.3-1L327 183c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8H463.5c0 0 0 0 0 0H472c13.3 0 24-10.7 24-24V72c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2L413.4 96.6c-87.6-86.5-228.7-86.2-315.8 1C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5c7.7-21.8 20.2-42.3 37.8-59.8zM16 312v7.6 .7V440c0 9.7 5.8 18.5 14.8 22.2s19.3 1.7 26.2-5.2l41.6-41.6c87.6 86.5 228.7 86.2 315.8-1c24.4-24.4 42.1-53.1 52.9-83.7c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.2 62.2-162.7 62.5-225.3 1L185 329c6.9-6.9 8.9-17.2 5.2-26.2s-12.5-14.8-22.2-14.8H48.4h-.7H40c-13.3 0-24 10.7-24 24z"/></svg>'
    
    const deleteButton = document.createElement('td')
    deleteButton.className = 'table_button'
    deleteButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="delete_button"><!--! Font Awesome Pro 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z"/></svg>`

    newRow.append(keyRow, valueRow, dateTimeRecord, updateButton, deleteButton)
    console.log(updateButton.parentElement.firstElementChild.textContent)
    updateButton.onclick = (e) => {
      let updatedRecord = {
                            keyRecord: e.currentTarget.parentElement.firstElementChild.textContent,
                            valueRecord: e.currentTarget.parentElement.firstElementChild.nextSibling.textContent
                          }
      updateRecord(db,updatedRecord)
    }
    deleteButton.onclick = (e) => {
      deleteRecord(db, e.currentTarget.parentElement.firstElementChild.textContent)
    }

    tbody.append(newRow)
  })
  table.append(header, tbody)
  wrapper.append(table)

}

function getDateTime(timestamp) {
  let date = new Date(timestamp)
  let day = date.getDate() <= 9 ? '0' + date.getDate() : date.getDate();
  let month = date.getMonth() <= 9 ? '0' + date.getMonth() : date.getMonth();
  let year = date.getFullYear() % 100 <= 9 ? '0' + date.getFullYear() % 100 : date.getFullYear();
  let hour = date.getHours() <= 9 ? '0' + date.getHours() : date.getHours();
  let minutes = date.getMinutes() <= 9 ? '0' + date.getMinutes() : date.getMinutes();
  let seconds = date.getSeconds() <= 9 ? '0' + date.getSeconds() : date.getSeconds();
  return `${day}.${month}.${year}, ${hour}:${minutes}:${seconds}`
}

addButton.addEventListener('click', (e) => {
  if (keyInput.value && valueInput.value) {
  addRecord(db,{keyRecord: keyInput.value, valueRecord: valueInput.value})}
})

// indexedDB.deleteDatabase('crudDB')