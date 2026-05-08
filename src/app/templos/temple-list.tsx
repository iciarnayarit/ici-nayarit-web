"use client";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/app/components/ui/dropdown-menu";
import { templeLocations } from "@/app/lib/temples-data";
import {
    loadSavedLocalTempleNames,
    SAVED_LOCAL_TEMPLE_NAMES_KEY,
    SAVED_TEMPLES_CHANGED_EVENT,
    toggleSavedLocalTempleName,
} from "@/lib/saved-temples";
import { ClipboardCopy, Share2, Bookmark, MapPin, ChevronDown } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { useIsMobile } from "@/app/hooks/use-mobile";
import { ensureClerkSignedInForFavoriteAdd } from "@/lib/require-clerk-sign-in";
import { grantEngagementPoints } from '@/lib/engagement-points';
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { normalizeSearchText, fuzzySimilarity } from "@/lib/fuzzy-search";
import { useDebouncedValue } from "@/app/hooks/use-debounced-value";

const grouped = templeLocations.reduce<Record<string, typeof templeLocations>>((acc, temple) => {
    const m = temple.municipality;
    if (!acc[m]) acc[m] = [];
    acc[m].push(temple);
    return acc;
}, {});

const municipalities = Object.keys(grouped).sort((a, b) => {
    // Tepic primero, Sierra del Nayar al final
    if (a === 'Tepic') return -1;
    if (b === 'Tepic') return 1;
    if (a === 'Sierra del Nayar') return 1;
    if (b === 'Sierra del Nayar') return -1;
    return a.localeCompare(b);
});

export default function TempleList() {
    const [selectedTemple, setSelectedTemple] = useState(templeLocations[0]);
    const [savedTemples, setSavedTemples] = useState<string[]>([]);
    const [expandedMunicipalities, setExpandedMunicipalities] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const isMobile = useIsMobile();
    const { isLoaded: authLoaded, isSignedIn } = useAuth();
    const { redirectToSignIn } = useClerk();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const debouncedSearchQuery = useDebouncedValue(searchQuery, 220);

    const refreshSaved = useCallback(() => {
        setSavedTemples(loadSavedLocalTempleNames());
    }, []);

    useEffect(() => {
        refreshSaved();
    }, [refreshSaved]);

    useEffect(() => {
        const onChange = () => refreshSaved();
        const onStorage = (e: StorageEvent) => {
            if (e.key === SAVED_LOCAL_TEMPLE_NAMES_KEY) refreshSaved();
        };
        window.addEventListener(SAVED_TEMPLES_CHANGED_EVENT, onChange);
        window.addEventListener("storage", onStorage);
        return () => {
            window.removeEventListener(SAVED_TEMPLES_CHANGED_EVENT, onChange);
            window.removeEventListener("storage", onStorage);
        };
    }, [refreshSaved]);

    useEffect(() => {
        const queryInUrl = searchParams.get('q') ?? '';
        if (queryInUrl !== searchQuery) {
            setSearchQuery(queryInUrl);
        }
    }, [searchParams, searchQuery]);

    useEffect(() => {
        const next = new URLSearchParams(searchParams.toString());
        const normalized = debouncedSearchQuery.trim();
        const current = searchParams.get('q') ?? '';
        if (normalized.length >= 2) {
            if (current === normalized) return;
            next.set('q', normalized);
        } else {
            if (!current) return;
            next.delete('q');
        }
        const queryString = next.toString();
        router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    }, [debouncedSearchQuery, pathname, router, searchParams]);

    const filteredMunicipalities = useMemo(() => {
        const normalizedQuery = normalizeSearchText(searchQuery);
        if (normalizedQuery.length < 2) return municipalities;

        return municipalities.filter((municipality) => {
            const inMunicipality = fuzzySimilarity(normalizeSearchText(municipality), normalizedQuery) >= 0.72;
            if (inMunicipality) return true;
            return grouped[municipality].some((temple) => {
                const name = normalizeSearchText(temple.nameKey);
                const address = normalizeSearchText(temple.addressKey);
                return (
                    fuzzySimilarity(name, normalizedQuery) >= 0.72 ||
                    fuzzySimilarity(address, normalizedQuery) >= 0.72 ||
                    name.includes(normalizedQuery) ||
                    address.includes(normalizedQuery)
                );
            });
        });
    }, [searchQuery]);

    const firstVisibleTemple = useMemo(() => {
        for (const municipality of filteredMunicipalities) {
            const temple = grouped[municipality][0];
            if (temple) return temple;
        }
        return null;
    }, [filteredMunicipalities]);

    useEffect(() => {
        if (!firstVisibleTemple) return;
        const selectedStillVisible = filteredMunicipalities.some((municipality) =>
            grouped[municipality].some((temple) => temple.nameKey === selectedTemple.nameKey)
        );
        if (!selectedStillVisible) {
            setSelectedTemple(firstVisibleTemple);
        }
    }, [filteredMunicipalities, firstVisibleTemple, selectedTemple.nameKey]);

    useEffect(() => {
        if (searchQuery.trim().length < 2) return;
        setExpandedMunicipalities(filteredMunicipalities);
    }, [filteredMunicipalities, searchQuery]);

    const handleShareInteraction = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const toggleSave = (e: React.MouseEvent, nameKey: string) => {
        e.stopPropagation();
        const alreadySaved = savedTemples.includes(nameKey);
        if (
            !ensureClerkSignedInForFavoriteAdd(
                authLoaded,
                isSignedIn === true,
                redirectToSignIn,
                alreadySaved
            )
        ) {
            return;
        }
        setSavedTemples(toggleSavedLocalTempleName(nameKey));
    };

    const toggleMunicipality = (m: string) => {
        setExpandedMunicipalities(prev =>
            prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
        );
        void grantEngagementPoints({
            action: 'bible_read',
            dedupeKey: `templos-search:${m}`,
            isSignedIn: authLoaded && isSignedIn === true,
        });
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${selectedTemple.lat},${selectedTemple.lng}`;
    const shareDetails = `Templo: ${selectedTemple.nameKey}\nDirección: ${selectedTemple.addressKey}`;
    const shareText = `¡Echa un vistazo a este templo!\n\n${shareDetails}`;
    const whatsappText = `${shareText}\n\nVer en Google Maps: ${googleMapsUrl}`;
    const twitterText = `¡Echa un vistazo a este templo! ${selectedTemple.nameKey}`;
    const textToCopy = `Templo: ${selectedTemple.nameKey}\nDirección: ${selectedTemple.addressKey}\nGoogle Maps: ${googleMapsUrl}`;

    const MunicipalityHeader = ({ name, count }: { name: string; count: number }) => (
        <button
            onClick={() => toggleMunicipality(name)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#FDF8EF] border border-[#B88A44]/20 hover:bg-[#B88A44]/10 transition-colors group"
        >
            <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#B88A44]" />
                <span className="text-sm font-bold text-[#7a5c2e]">{name}</span>
                <span className="text-xs text-[#B88A44]/70 font-medium">({count})</span>
            </div>
            <ChevronDown className={`h-4 w-4 text-[#B88A44] transition-transform ${expandedMunicipalities.includes(name) ? 'rotate-180' : ''}`} />
        </button>
    );

    if (isMobile) {
        return (
            <div className="flex flex-col space-y-6">
                <div className="sticky top-[4.5rem] z-20 rounded-xl border border-gray-200 bg-white/95 p-3 backdrop-blur">
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar templo, municipio o dirección..."
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                    />
                </div>
                {filteredMunicipalities.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-gray-300 bg-white p-4 text-center text-sm text-gray-500">
                        No se encontraron templos para esa búsqueda.
                    </p>
                ) : null}
                {filteredMunicipalities.map(municipality => {
                    const temples = grouped[municipality];
                    const isExpanded = expandedMunicipalities.includes(municipality);
                    return (
                        <div key={municipality}>
                            <MunicipalityHeader name={municipality} count={temples.length} />
                            {isExpanded && (
                                <div className="mt-2 flex flex-col space-y-3 pl-1">
                                    {temples.map((temple, index) => {
                                        const isSelected = selectedTemple.nameKey === temple.nameKey;
                                        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${temple.lat},${temple.lng}`;
                                        const wazeUrl = `https://waze.com/ul?ll=${temple.lat},${temple.lng}&navigate=yes`;
                                        const whatsappMsg = encodeURIComponent(`¡Echa un vistazo a este templo!\n\nTemplo: ${temple.nameKey}\nDirección: ${temple.addressKey}\n\nVer en Google Maps: ${mapsUrl}`);
                                        return (
                                            <Card
                                                key={index}
                                                onClick={() => {
                                                    setSelectedTemple(temple);
                                                    void grantEngagementPoints({
                                                        action: 'bible_read',
                                                        dedupeKey: `templos-select:${temple.nameKey}`,
                                                        isSignedIn: authLoaded && isSignedIn === true,
                                                    });
                                                }}
                                                className={`cursor-pointer transition-all ${isSelected ? 'border-primary shadow-md' : ''}`}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-bold text-base leading-snug">{temple.nameKey}</h3>
                                                            <p className="text-sm text-gray-500 mt-0.5 break-words">{temple.addressKey}</p>
                                                        </div>
                                                        <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                                                            <button
                                                                onClick={(e) => toggleSave(e, temple.nameKey)}
                                                                className="p-2.5 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                                                            >
                                                                <Bookmark className={`h-5 w-5 transition-colors ${savedTemples.includes(temple.nameKey) ? 'text-[#B88A44] fill-[#B88A44]' : 'text-gray-400 fill-none'}`} />
                                                            </button>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <button className="p-2.5 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center">
                                                                        <Share2 className="h-5 w-5 text-gray-400" />
                                                                    </button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem asChild>
                                                                        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="w-full cursor-pointer">Google Maps</a>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem asChild>
                                                                        <a href={wazeUrl} target="_blank" rel="noopener noreferrer" className="w-full cursor-pointer">Waze</a>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem asChild>
                                                                        <a href={`https://api.whatsapp.com/send?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer" className="w-full cursor-pointer">WhatsApp</a>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem onClick={() => handleCopy(`Templo: ${temple.nameKey}\nDirección: ${temple.addressKey}\nGoogle Maps: ${mapsUrl}`)} className="cursor-pointer">
                                                                        <ClipboardCopy className="mr-2 h-4 w-4" /><span>Copiar</span>
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </div>

                                                    {isSelected && (
                                                        <div className="mt-4">
                                                            <iframe
                                                                key={temple.nameKey}
                                                                src={temple.embedUrl}
                                                                width="100%"
                                                                height="260"
                                                                style={{ border: 0, borderRadius: '12px' }}
                                                                allowFullScreen={false}
                                                                loading="lazy"
                                                                referrerPolicy="no-referrer-when-downgrade"
                                                            />
                                                            <div className="mt-3 grid grid-cols-2 gap-2" onClick={e => e.stopPropagation()}>
                                                                <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                                                                    className="flex items-center justify-center gap-2 py-2.5 px-3 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors">
                                                                    <Share2 className="h-4 w-4" /> Google Maps
                                                                </a>
                                                                <a href={wazeUrl} target="_blank" rel="noopener noreferrer"
                                                                    className="flex items-center justify-center gap-2 py-2.5 px-3 bg-sky-50 text-sky-600 rounded-xl text-sm font-semibold hover:bg-sky-100 transition-colors">
                                                                    <Share2 className="h-4 w-4" /> Waze
                                                                </a>
                                                            </div>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4 flex flex-col space-y-5">
                <div className="sticky top-[4.5rem] z-20 rounded-xl border border-gray-200 bg-white/95 p-3 backdrop-blur">
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar templo, municipio o dirección..."
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                    />
                </div>
                {filteredMunicipalities.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-gray-300 bg-white p-4 text-center text-sm text-gray-500">
                        No se encontraron templos para esa búsqueda.
                    </p>
                ) : null}
                {filteredMunicipalities.map(municipality => {
                    const temples = grouped[municipality];
                    const isExpanded = expandedMunicipalities.includes(municipality);
                    return (
                        <div key={municipality}>
                            <MunicipalityHeader name={municipality} count={temples.length} />
                            {isExpanded && (
                                <div className="mt-2 flex flex-col space-y-2 pl-1">
                                    {temples.map((temple, index) => (
                                        <Card
                                            key={index}
                                            onClick={() => {
                                                setSelectedTemple(temple);
                                                void grantEngagementPoints({
                                                    action: 'bible_read',
                                                    dedupeKey: `templos-select:${temple.nameKey}`,
                                                    isSignedIn: authLoaded && isSignedIn === true,
                                                });
                                            }}
                                            className={`cursor-pointer transition-all ${selectedTemple.nameKey === temple.nameKey ? 'border-primary shadow-sm' : 'hover:border-gray-300'}`}
                                        >
                                            <CardContent className="p-4">
                                                <h3 className="font-bold text-sm">{temple.nameKey}</h3>
                                                <p className="text-xs text-gray-500 mt-0.5">{temple.addressKey}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="md:col-span-8 sticky top-20 self-start">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-grow pr-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="inline-flex items-center gap-1 text-xs bg-[#FDF8EF] text-[#B88A44] border border-[#B88A44]/20 rounded-full px-2 py-0.5 font-semibold">
                                        <MapPin className="h-3 w-3" />{selectedTemple.municipality}
                                    </span>
                                </div>
                                <h3 className="font-bold">{selectedTemple.nameKey}</h3>
                                <p className="text-sm text-gray-500">{selectedTemple.addressKey}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" onClick={(e) => toggleSave(e, selectedTemple.nameKey)} className="hover:bg-transparent active:bg-transparent">
                                    <Bookmark className={`h-5 w-5 transition-colors ${savedTemples.includes(selectedTemple.nameKey) ? 'text-[#B88A44] fill-[#B88A44]' : 'text-gray-500 fill-none'}`} />
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={handleShareInteraction}>
                                            <Share2 className="h-5 w-5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent onClick={handleShareInteraction}>
                                        <DropdownMenuItem asChild>
                                            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="w-full h-full cursor-pointer">
                                                Google Maps
                                            </a>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <a href={`https://waze.com/ul?ll=${selectedTemple.lat},${selectedTemple.lng}&navigate=yes`} target="_blank" rel="noopener noreferrer" className="w-full h-full cursor-pointer">
                                                Waze
                                            </a>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(googleMapsUrl)}&quote=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="w-full h-full cursor-pointer">
                                                Facebook
                                            </a>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(googleMapsUrl)}&text=${encodeURIComponent(twitterText)}`} target="_blank" rel="noopener noreferrer" className="w-full h-full cursor-pointer">
                                                Twitter
                                            </a>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`} target="_blank" rel="noopener noreferrer" className="w-full h-full cursor-pointer">
                                                WhatsApp
                                            </a>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleCopy(textToCopy)} className="cursor-pointer">
                                            <ClipboardCopy className="mr-2 h-4 w-4" />
                                            <span>Copiar</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        <div className="mt-4">
                            <iframe
                                key={selectedTemple.nameKey}
                                src={selectedTemple.embedUrl}
                                width="100%"
                                height="450"
                                style={{ border: 0 }}
                                allowFullScreen={false}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
