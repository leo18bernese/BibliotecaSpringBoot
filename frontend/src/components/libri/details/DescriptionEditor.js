import {Editor} from '@tinymce/tinymce-react';
import {useRef, useImperativeHandle, forwardRef, useState, useEffect} from 'react';

const DescriptionEditor = forwardRef(({initialContent}, ref) => {
    const editorRef = useRef(null);
    const [isEditorReady, setIsEditorReady] = useState(false);
    const pendingContentRef = useRef(initialContent || '');

    useEffect(() => {
        pendingContentRef.current = initialContent || '';

        // Se l'editor è già pronto, imposta il contenuto direttamente
        if (editorRef.current && isEditorReady) {
            editorRef.current.setContent(initialContent || '');
        }
    }, [initialContent, isEditorReady]);

    const setContent = (content) => {
        if (editorRef.current && isEditorReady) {
            editorRef.current.setContent(content || '');
        } else {
            pendingContentRef.current = content || '';
        }
    };

    const getContent = () => {
        if (editorRef.current) {
            return editorRef.current.getContent();
        }
        return '';
    };

    useEffect(() => {
        if (initialContent !== undefined) {
            setContent(initialContent);
        }
    }, [initialContent]);

    useImperativeHandle(ref, () => ({
        getContent,
        setContent
    }));

    const handleEditorInit = (evt, editor) => {
        editorRef.current = editor;
        setIsEditorReady(true);

        // Imposta il contenuto quando l'editor è pronto
        if (pendingContentRef.current) {
            editor.setContent(pendingContentRef.current);
        }
    };

    return (
        <Editor
            onInit={handleEditorInit}
            apiKey='e1s9znkhondw0j58p1pu7ruf80f5xtt3qfb5u6893ry46x02'
            init={{
                plugins: [
                    'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
                    'checklist', 'mediaembed', 'casechange', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable', 'advcode', 'editimage', 'advtemplate', 'ai', 'mentions', 'tinycomments', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 'inlinecss', 'markdown', 'importword', 'exportword', 'exportpdf'
                ],
                toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
                tinycomments_mode: 'embedded',
                tinycomments_author: 'Author name',
                mergetags_list: [
                    {value: 'First.Name', title: 'First Name'},
                    {value: 'Email', title: 'Email'},
                ],
                ai_request: (request, respondWith) => respondWith.string(() => Promise.reject('See docs to implement AI Assistant')),
            }}
        />
    );
});

export default DescriptionEditor;