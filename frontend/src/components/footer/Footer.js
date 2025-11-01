import {Link} from "react-router-dom";

const getSection = (title, items) => {
    return (
        <div>
            <h3 className="font-bold text-lg mb-4">{title}</h3>
            <ul className="space-y-2.5">
                {getUlContent(items)}
            </ul>
        </div>
    );
}

const getUlContent = (items) => {
    return items.map((item, index) => (
        <li key={index} className="mb-2">
            <Link to={item[0]} className="hover:underline">
                {item[1]}
            </Link>
        </li>
    ));
}

const Footer = () => {
    return (
        <footer className="text-white mt-10" style={{backgroundColor: '#031d3a', padding: '40px 20px'}}>
            <div className="container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left">

                    {getSection('Dani Commerce', [
                        ['/chi-siamo', 'Chi siamo'],
                        ['/lavora-con-noi', 'Lavora con noi'],
                        ['/sostenibilita', 'Sostenibilità'],
                        ['/sitemap', 'Sitemap']
                    ])}

                    {getSection('Servizi', [
                        ['/reso-rimborso', 'Reso e rimborso'],
                        ['/diritto-recesso', 'Diritto di recesso'],
                        ['/spedizioni', 'Spedizioni e consegne']
                    ])}

                    {getSection('Contatti e Area legale', [
                        ['/contatti', 'Contatti e FAQ'],
                        ['/privacy', 'Privacy policy'],
                        ['/cookies', 'Cookie policy'],
                        ['/termini-vendita', 'Condizioni di vendita'],
                        ['/termini-uso', 'Condizioni d\'uso']
                    ])}

                    <div>
                        <h3 className="font-bold mb-4">Seguici su</h3>
                        <div className="flex space-x-4">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:underline">Facebook</a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:underline">Instagram</a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:underline">LinkedIn</a>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-8 pt-8 border-t border-gray-700">
                    &copy; {new Date().getFullYear()} Dani Commerce. Tutti i diritti riservati.
                </div>
            </div>
        </footer>
    );
}

export default Footer;