import axios from "axios";
import {useNavigate, useParams} from "react-router-dom";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import EditableField from "./fields/EditableField";
import React, {useEffect, useMemo, useRef, useState} from "react";
import RemovableField from "./fields/RemovableField";
import toast from "react-hot-toast";
import MaskedSuggestionInput from "./fields/MaskedSuggetionInput";
import CheckableField from "./fields/CheckableField";
import {usePageTitle} from "../../utils/usePageTitle";

const fetchBookById = async (id) => {
    const {data} = await axios.get(`/api/libri/${id}`);
    console.log("fetched book data:", data);
    return data;
};

const fetchBookExists = async (id) => {
    if (!id || id <= 0) return false;
    const {data} = await axios.get(`/api/libri/exists/${id}`);
    return data;
}

const fetchImageIds = async (id) => {
    try {
        const {data} = await axios.get(`/api/images/${id}`);
        return data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.warn("No images found for this book:", error);
            return -1;
        }

        throw error; // Rethrow other errors
    }
}

const fetchAutoriList = async () => {
    const {data} = await axios.get('/api/autori');
    return data;
}

const updateBook = async ({id, bookData}) => {
    const {data} = await axios.put(`/api/libri/${id}`, bookData);
    return data;
}


const AdminBook = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();


    const {data: book, isLoading: isBookLoading, error: bookError} = useQuery({
        queryKey: ['book', id],
        queryFn: () => fetchBookById(id),
    });

    const {data: bookExists, isLoading: isBookExistsLoading, error: bookExistsError} = useQuery({
        queryKey: ['bookExists', id],
        queryFn: () => fetchBookExists(id),

    });

    const {data: autoriList, isLoading: isAutoriListLoading} = useQuery({
        queryKey: ['autoriList'],
        queryFn: fetchAutoriList,
        enabled: !!book,
    });

    const descriptionEditorRef = useRef(null);

    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [genere, setGenere] = useState('');
    const [annoPubblicazione, setAnnoPubblicazione] = useState('');
    const [numeroPagine, setNumeroPagine] = useState('');
    const [editore, setEditore] = useState('');
    const [lingua, setLingua] = useState('');
    const [isbn, setIsbn] = useState('');
    const [dimensioni, setDimensioni] = useState({});
    const [description, setDescription] = useState("");
    const [characteristics, setCharacteristics] = useState({});

    // Inizializza gli stati quando book è disponibile
    useEffect(() => {
        if (book) {
            setTitle(book.titolo || '');
            setAuthor(book.autore.nome || '');
            setGenere(book.genere || '');
            setAnnoPubblicazione(book.annoPubblicazione || '');
            setNumeroPagine(book.numeroPagine || '');
            setEditore(book.editore || '');
            setLingua(book.lingua || '');
            setIsbn(book.isbn || '');
            setDimensioni(book.dimensioni || {});
            setDescription(book.descrizione?.descrizioneHtml || '');
            setCharacteristics(book.descrizione?.caratteristiche || {});
        }
    }, [book]);


    const {data: images, isLoading: areImagesLoading} = useQuery({
        queryKey: ['images', id],
        queryFn: () => fetchImageIds(id),
    });

    const mutation = useMutation({
        mutationFn: updateBook,
        onSuccess: () => {
            toast.success('Libro aggiornato con successo!');

            navigate("/admin/book/" + id);

            queryClient.invalidateQueries({queryKey: ['book', id]});
        },
        onError: (error) => {
            toast.error(`Errore nell'aggiornamento del libro: ${error.response?.data?.message || error.message}`);
        },
    });

    const handleSave = () => {
        // const currentDescription = getEditorContent(); // Se si usa l'editor, altrimenti lo stato 'description'
        const bookData = {
            titolo: title,
            autore: author,
            genere,
            annoPubblicazione: parseInt(annoPubblicazione, 10),
            numeroPagine: parseInt(numeroPagine, 10),
            editore,
            lingua,
            isbn,
            dimensioni,
            descrizione: description,
            caratteristiche: characteristics,
        };

        mutation.mutate({id, bookData});
    };


    const getEditorContent = () => {
        if (descriptionEditorRef.current) {
            const content = descriptionEditorRef.current.getContent();
            setDescription(content);
            return content;
        }
        return '';
    };

    const getAuthorSuggestions = (query) => {
        if (!autoriList || query.length < 2) {
            return [];
        }
        return autoriList.filter(autore =>
            autore.nome.toLowerCase().includes(query.toLowerCase())
        ).map(autore => autore.nome);
    };

    usePageTitle('Book #' + id + ' - Editor');

    const initialContent = useMemo(() => {
        return book?.descrizione?.descrizioneHtml || '';
    }, [book?.descrizione?.descrizioneHtml]);

    if (isBookLoading || isBookExistsLoading || areImagesLoading) {
        return <div>Loading...</div>;
    }

    if (bookError || bookExistsError) {
        return <div>Error loading book data.</div>;
    }

    if (!book || !bookExists) {
        return <div className="p-4">Book not found or does not exist.</div>;
    }

    console.log("dimensioni", dimensioni);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-lg font-semibold">Book Editor</h1>
            <p className="text-sm text-gray-500">
                You can edit the book details, such as title, author, and description here.
                You can't change the storage information, such as the number of copies or the location.
            </p>

            <div className="mt-8 p-4">
                <h2 className="text-md font-semibold">Book Details</h2>

                <EditableField key={`title-${book?.id || 'new'}`}
                               id="title"
                               label="Title" icon="book"
                               value={title}
                               placeholder="Enter book title"
                               minChars={2} maxChars={128}
                               onChange={(newTitle) => {
                                   setTitle(newTitle);
                               }}
                />

                <MaskedSuggestionInput
                    id="author" label="Author" icon="user"
                    value={author}
                    placeholder="Search or enter author name"
                    minChars={1} maxChars={30}
                    fetchSuggestions={getAuthorSuggestions}
                    onChange={(newAuthor) => {
                        setAuthor(newAuthor);
                    }}
                />


                <EditableField id="genere" label="Genre" icon="reading"
                               value={genere}
                               placeholder="Enter book genre"
                               minChars={2} maxChars={30}
                               onChange={(newGenere) => {
                                   setGenere(newGenere);
                               }}
                />

                <EditableField id="annoPubblicazione" label="Publication Year" icon="calendar"
                               value={annoPubblicazione}
                               placeholder="Enter publication year"
                               minChars={1700} maxChars={2025}
                               type="number"
                               onChange={(newAnno) => {
                                   setAnnoPubblicazione(newAnno);
                               }}
                />

                <EditableField id="numeroPagine" label="Number of Pages" icon="file"
                               value={numeroPagine}
                               placeholder="Enter number of pages"
                               minChars={1} maxChars={10000}
                               type="number"
                               onChange={(newNumero) => {
                                   setNumeroPagine(newNumero);
                               }}
                />

                <EditableField id="editore" label="Editor" icon="edit"
                               value={editore}
                               placeholder="Enter editor name"
                               minChars={2} maxChars={48}
                               onChange={(newEditore) => {
                                   setEditore(newEditore);
                               }}
                />

                <EditableField id="lingua" label="Language" icon="translate"
                               value={lingua}
                               placeholder="Enter language"
                               description={`The language of the book, e.g., "English", "Italian", etc.`}
                               minChars={2} maxChars={24}
                               onChange={(newLingua) => {
                                   setLingua(newLingua);
                               }}
                />

                <EditableField id="isbn" label="ISBN" icon="barcode"
                               value={isbn}
                               placeholder="Enter ISBN"
                               minChars={10}
                               onChange={(newIsbn) => {
                                   setIsbn(newIsbn);
                               }}
                />
            </div>

            {/*<DescriptionEditor
                    ref={descriptionEditorRef}
                    initialContent={initialContent}
                />

                <button onClick={getEditorContent}>Get Description Content</button>*/}

            <div className="mt-8 border-t-2  border-gray-600 p-4">
                <h2 className="text-md font-semibold">Characteristics</h2>
                <div className=" pl-5">

                    {Object.entries(characteristics).map(([key, value]) => (
                        <RemovableField key={key} id={key} label={key}
                                        value={value}
                                        placeholder={`Enter ${key} value`}
                                        minChars={2} maxChars={30}
                                        onChange={(newValue) => {
                                            setCharacteristics(prev => ({
                                                ...prev,
                                                [key]: newValue
                                            }));
                                        }}
                                        onRemove={() => {
                            setCharacteristics(prev => {
                                const newCharacteristics = {...prev};
                                delete newCharacteristics[key];
                                return newCharacteristics;
                            });
                        }}
                        />
                    ))}

                    {/* add new characteristic */}
                    <RemovableField id="newCharacteristic" label=" New Characteristic"
                                    icon="plus text-green-600 font-bold"
                                    value=""
                                    placeholder="Enter new characteristic"
                                    minChars={2} maxChars={30}
                                    onChange={(newValue) => {
                                        if (newValue) {

                                            if (characteristics[newValue]) {
                                                toast.error(`Characteristic "${newValue}" already exists.`);
                                                return;
                                            }

                                            setCharacteristics(prev => ({
                                                ...prev,
                                                [newValue]: ''
                                            }));
                                        }

                                    }}
                                    removable={false}
                    />
                </div>
            </div>

            <div className="mt-8 border-t-2  border-gray-600 p-4">
                <h2 className="text-md font-semibold">Book dimensions</h2>

                <EditableField key='length'
                               id="length" label="Length (cm)" icon="ruler"
                               value={dimensioni.length || ''}
                               placeholder="Enter length in cm"
                               minChars={1}
                               type="number"
                               onChange={(newLength) => {
                                   setDimensioni(prev => ({...prev, length: newLength}));
                               }}
                />

                <EditableField key='width'
                               id="width" label="Width (cm)" icon="ruler"
                               value={dimensioni.width || ''}
                               placeholder="Enter width in cm"
                               minChars={1}
                               type="number"
                               onChange={(newWidth) => {
                                   setDimensioni(prev => ({...prev, width: newWidth}));
                               }}
                />

                <EditableField key='height'
                               id="height" label="Height (cm)" icon="ruler"
                               value={dimensioni.height || ''}
                               placeholder="Enter height in cm"
                               minChars={1}
                               type="number"
                               onChange={(newHeight) => {
                                   setDimensioni(prev => ({...prev, height: newHeight}));
                               }}
                />

                <EditableField key='weight'
                               id="weight" label="Weight (kg)" icon="dumbbell"
                               value={dimensioni.weight || ''}
                               placeholder="Enter weight in kg"
                               minChars={1}
                               type="number"
                               onChange={(newWeight) => {
                                   setDimensioni(prev => ({...prev, weight: newWeight}));
                               }}
                />
            </div>

            <div className="mt-8 border-t-2  border-gray-600 p-4">
                <h2 className="text-md font-semibold">Visibility and Status</h2>

                <CheckableField key="hidden"
                                id="hidden" label="Hidden" icon="badge-info"
                                value={book?.hidden ? 'Yes' : 'No'}
                                placeholder="Is this book hidden?"
                                minChars={1} maxChars={3}
                                type="checkbox"
                                description="Check this box to hide the book from public listings."
                                confirm={true}
                                confirmText="Are you sure you want to hide this book?"
                                onChange={(newHidden) => {
                                    // This is a read-only field, so we don't change it
                                    // but you can implement logic to toggle visibility
                                    console.log("Hidden field is read-only");
                                }}
                />
            </div>

            <div className="mt-8 pt-5 flex justify-end">

                <button
                    onClick={() => {
                        if(window.confirm("Are you sure you want to discard changes?")) {
                            navigate("/admin/book/" + id);
                        }
                    }}
                    className="bg-red-300 hover:bg-red-400 text-red-900 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                >
                    Discard Changes
                </button>

                <button
                    onClick={() => {
                        if (!title || !author || !genere || !annoPubblicazione || !numeroPagine || !editore || !lingua || !isbn) {
                            toast.error('Please fill in all required fields.');
                            return;
                        }

                        if(window.confirm("Are you sure you want to save changes?")) {
                            handleSave();
                        }
                    }}
                    disabled={mutation.isPending}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400"
                >
                    {mutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );

}

export default AdminBook;