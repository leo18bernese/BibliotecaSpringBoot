const NotFound = () => {
    return <div className="text-center my-auto py-2 text-xl">

        <img src="https://i.redd.it/ever-wondered-why-this-famous-crying-cat-meme-looks-so-sad-v0-83ecyn5rjuwd1.jpg?width=1340&format=pjpg&auto=webp&s=67e776575f298cdd0524295219ff27f0b03d0f78"
                alt="404 Not Found" className="mx-auto max-w-xs mb-8"/>

        <p>Sfortunatamente, la pagina che stai cercando non esiste.</p>
        <p>Controlla l'URL o torna alla <a href="/" className="text-blue-600 underline">pagina principale</a>.</p>

    </div>;
}

export default NotFound;