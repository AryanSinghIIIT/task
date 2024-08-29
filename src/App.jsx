import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table } from "./components/Table";
import { Modal } from "./components/Modal";
import "./App.css";

// Fetch API URL from environment variable
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [rowToEdit, setRowToEdit] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; // Number of items per page

  useEffect(() => {
    // Fetch initial data from the API
    if (apiUrl) {
      axios.get(`${apiUrl}/tasks`)
        .then(response => setRows(response.data))
        .catch(error => console.error("Error fetching data: ", error));
    } else {
      console.error("API URL is not defined.");
    }
  }, [apiUrl]); // Depend on apiUrl to refetch if it changes

  const handleDeleteRow = (id) => {
    if (apiUrl) {
      axios.delete(`${apiUrl}/tasks/${id}`)
        .then(() => {
          setRows(prevRows => prevRows.filter(row => row.id !== id));
        })
        .catch(error => console.error("Error deleting data: ", error));
    }
  };

  const handleEditRow = (id) => {
    setRowToEdit(id);
    setModalOpen(true);
  };

  const handleSubmit = (newRow) => {
    if (apiUrl) {
      if (rowToEdit === null) {
        axios.post(`${apiUrl}/tasks`, newRow)
          .then(response => {
            setRows(prevRows => [...prevRows, response.data]);
            setModalOpen(false);
            setRowToEdit(null);
          })
          .catch(error => console.error("Error adding data: ", error));
      } else {
        axios.put(`${apiUrl}/tasks/${rowToEdit}`, newRow)
          .then(response => {
            setRows(prevRows => prevRows.map(row => (row.id === rowToEdit ? response.data : row)));
            setModalOpen(false);
            setRowToEdit(null);
          })
          .catch(error => console.error("Error updating data: ", error));
      }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Calculate total pages and page numbers
  const totalPages = Math.ceil(rows.length / itemsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="App">
      {rows.length > 0 ? (
        <>
          <Table
            rows={rows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
            deleteRow={handleDeleteRow}
            editRow={handleEditRow}
            setModalOpen={setModalOpen}
            setRows={setRows}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
          />
          {modalOpen && (
            <Modal
              closeModal={() => {
                setModalOpen(false);
                setRowToEdit(null);
              }}
              onSubmit={handleSubmit}
              defaultValue={rowToEdit !== null ? rows.find(row => row.id === rowToEdit) : null}
            />
          )}
          <div className="pagination-controls">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              Previous
            </button>
            {pageNumbers.map(number => (
              <button
                key={number}
                onClick={() => handlePageChange(number)}
                className={`pagination-btn ${number === currentPage ? "active" : ""}`}
              >
                {number}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <p>No data available.</p>
      )}
    </div>
  );
}

export default App;
