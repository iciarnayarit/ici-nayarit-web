'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Import all bible books
import gn from '@/lib/bible/gn.json';
import ex from '@/lib/bible/ex.json';
import lv from '@/lib/bible/lv.json';
import nm from '@/lib/bible/nm.json';
import dt from '@/lib/bible/dt.json';
import js from '@/lib/bible/js.json';
import jud from '@/lib/bible/jud.json';
import rt from '@/lib/bible/rt.json';
import sa1 from '@/lib/bible/1-samuel.json';
import sa2 from '@/lib/bible/2-samuel.json';
import k1 from '@/lib/bible/1-kings.json';
import k2 from '@/lib/bible/2-kings.json';
import c1 from '@/lib/bible/1-chronicles.json';
import c2 from '@/lib/bible/2-chronicles.json';
import ezr from '@/lib/bible/ezr.json';
import ne from '@/lib/bible/ne.json';
import et from '@/lib/bible/et.json';
import job from '@/lib/bible/job.json';
import ps from '@/lib/bible/ps.json';
import prv from '@/lib/bible/prv.json';
import ec from '@/lib/bible/ec.json';
import so from '@/lib/bible/so.json';
import is from '@/lib/bible/is.json';
import jr from '@/lib/bible/jr.json';
import lm from '@/lib/bible/lm.json';
import ez from '@/lib/bible/ez.json';
import dn from '@/lib/bible/dn.json';
import ho from '@/lib/bible/ho.json';
import jl from '@/lib/bible/jl.json';
import am from '@/lib/bible/am.json';
import ob from '@/lib/bible/ob.json';
import jn from '@/lib/bible/jn.json';
import mi from '@/lib/bible/mi.json';
import na from '@/lib/bible/na.json';
import hk from '@/lib/bible/hk.json';
import zp from '@/lib/bible/zp.json';
import hg from '@/lib/bible/hg.json';
import zc from '@/lib/bible/zc.json';
import ml from '@/lib/bible/ml.json';
import mt from '@/lib/bible/mt.json';
import mk from '@/lib/bible/mk.json';
import lk from '@/lib/bible/lk.json';
import jo from '@/lib/bible/jo.json';
import act from '@/lib/bible/act.json';
import rm from '@/lib/bible/rm.json';
import co1 from '@/lib/bible/1-corinthians.json';
import co2 from '@/lib/bible/2-corinthians.json';
import gl from '@/lib/bible/gl.json';
import eph from '@/lib/bible/eph.json';
import ph from '@/lib/bible/ph.json';
import col from '@/lib/bible/colossians.json';
import th1 from '@/lib/bible/1-thessalonians.json';
import th2 from '@/lib/bible/2-thessalonians.json';
import ti1 from '@/lib/bible/1-timothy.json';
import ti2 from '@/lib/bible/2-timothy.json';
import tt from '@/lib/bible/tt.json';
import phm from '@/lib/bible/phm.json';
import hb from '@/lib/bible/hb.json';
import jm from '@/lib/bible/jm.json';
import pe1 from '@/lib/bible/1-peter.json';
import pe2 from '@/lib/bible/2-peter.json';
import jn1 from '@/lib/bible/1-john.json';
import jn2 from '@/lib/bible/2-john.json';
import jn3 from '@/lib/bible/3-john.json';
import jd from '@/lib/bible/jd.json';
import re from '@/lib/bible/re.json';

const bibleData: { [key: string]: any } = {
    'génesis': gn, 'éxodo': ex, 'levítico': lv, 'números': nm, 'deuteronomio': dt, 'josué': js, 'jueces': jud, 'rut': rt,
    '1 samuel': sa1, '2 samuel': sa2, '1 reyes': k1, '2 reyes': k2, '1 crónicas': c1, '2 crónicas': c2, 'esdras': ezr,
    'nehemías': ne, 'ester': et, 'job': job, 'salmos': ps, 'proverbios': prv, 'eclesiastés': ec, 'cantar de los cantares': so,
    'isaías': is, 'jeremías': jr, 'lamentaciones': lm, 'ezequiel': ez, 'daniel': dn, 'oseas': ho, 'joel': jl,
    'amós': am, 'abdías': ob, 'jonás': jn, 'miqueas': mi, 'nahúm': na, 'habacuc': hk, 'sofonías': zp, 'hageo': hg,
    'zacarías': zc, 'malaquías': ml, 'mateo': mt, 'marcos': mk, 'lucas': lk, 'juan': jo, 'hechos': act, 'romanos': rm,
    '1 corintios': co1, '2 corintios': co2, 'gálatas': gl, 'efesios': eph, 'filipenses': ph, 'colosenses': col,
    '1 tesalonicenses': th1, '2 tesalonicenses': th2, '1 timoteo': ti1, '2 timoteo': ti2, 'tito': tt, 'filemón': phm,
    'hebreos': hb, 'santiago': jm, '1 pedro': pe1, '2 pedro': pe2, '1 juan': jn1, '2 juan': jn2, '3 juan': jn3,
    'judas': jd, 'apocalipsis': re,
};

const planDays = [
    { day: 1, reading: 'Génesis 1;2;3;', summary: 'Orígenes' },
    { day: 2, reading: 'Génesis 4;5;6;7;', summary: 'Orígenes' },
    { day: 3, reading: 'Génesis 8;9;10;11;', summary: 'Orígenes' },
    { day: 4, reading: 'Job 1;2;3;4;', summary: 'Orígenes' },
    { day: 5, reading: 'Job 5;6;7;8;9;', summary: 'Orígenes' },
    { day: 6, reading: 'Job 10;11;12;13;', summary: 'Orígenes' },
    { day: 7, reading: 'Job 14;15;16;17;', summary: 'Orígenes' },
    { day: 8, reading: 'Job 18;19;20;21;', summary: 'Orígenes' },
    { day: 9, reading: 'Job 22;23;24;25;26;', summary: 'Orígenes' },
    { day: 10, reading: 'Job 27;28;29;30;31;', summary: 'Orígenes' },
    { day: 11, reading: 'Job 32;33;34;35;36;37', summary: 'Orígenes' },
    { day: 12, reading: 'Job 38;39;', summary: 'Continuación de Job' },
    { day: 13, reading: 'Job 40;41;42;', summary: 'Continuación de Job' },
    { day: 14, reading: 'Génesis 12;13;14;15;', summary: 'Continuación de Job' },
    { day: 15, reading: 'Génesis 16;17;18;', summary: 'Continuación de Job' },
    { day: 16, reading: 'Génesis 19;20;21;', summary: 'Continuación de Job' },
    { day: 17, reading: 'Génesis 22;23;24;', summary: 'Continuación de Job' },
    { day: 18, reading: 'Génesis 25;26;', summary: 'Continuación de Job' },
    { day: 19, reading: 'Génesis 27;28;29;', summary: 'Continuación de Job' },
    { day: 20, reading: 'Génesis 30;31;32;', summary: 'Continuación de Job' },
    { day: 21, reading: 'Génesis 33;34;35;36;', summary: 'Continuación de Job' },
    { day: 22, reading: 'Génesis 37;38;39;', summary: 'Patriarcas' },
    { day: 23, reading: 'Génesis 40;41;42;', summary: 'Patriarcas' },
    { day: 24, reading: 'Génesis 43;44;45;', summary: 'Patriarcas' },
    { day: 25, reading: 'Génesis 46;47;48;', summary: 'Patriarcas' },
    { day: 26, reading: 'Génesis 49;50;', summary: 'Patriarcas' },
    { day: 27, reading: 'Éxodo 1;2;3;4;', summary: 'Patriarcas' },
    { day: 28, reading: 'Éxodo 5;6;7;', summary: 'Patriarcas' },
    { day: 29, reading: 'Éxodo 8;9;10;', summary: 'Patriarcas' },
    { day: 30, reading: 'Éxodo 11;12;13;', summary: 'Patriarcas' },
    { day: 31, reading: 'Éxodo 14;15;16;', summary: 'Patriarcas' },
    { day: 32, reading: 'Éxodo 17;18;19;20;', summary: 'Patriarcas' },
    { day: 33, reading: 'Éxodo 21;22;23;', summary: 'Patriarcas' },
    { day: 34, reading: 'Éxodo 24;25;26;27;', summary: 'Patriarcas' },
    { day: 35, reading: 'Éxodo 28;29;30;31;', summary: 'Patriarcas' },
    { day: 36, reading: 'Éxodo 32;33;34;', summary: 'Patriarcas' },
    { day: 37, reading: 'Éxodo 35;36;37;', summary: 'Ley y tabernáculo' },
    { day: 38, reading: 'Éxodo 38;39;40;', summary: 'Ley y tabernáculo' },
    { day: 39, reading: 'Levítico 1;2;3;4;', summary: 'Ley y tabernáculo' },
    { day: 40, reading: 'Levítico 5;6;7;', summary: 'Ley y tabernáculo' },
    { day: 41, reading: 'Levítico 8;9;10;', summary: 'Ley y tabernáculo' },
    { day: 42, reading: 'Levítico 11;12;13;', summary: 'Ley y tabernáculo' },
    { day: 43, reading: 'Levítico 14;15;', summary: 'Ley y tabernáculo' },
    { day: 44, reading: 'Levítico 16;17;18;', summary: 'Ley y tabernáculo' },
    { day: 45, reading: 'Levítico 19;20;21;', summary: 'Ley y tabernáculo' },
    { day: 46, reading: 'Levítico 22;23;', summary: 'Ley y tabernáculo' },
    { day: 47, reading: 'Levítico 24;25;', summary: 'Ley y tabernáculo' },
    { day: 48, reading: 'Levítico 26;27;', summary: 'Ley y tabernáculo' },
    { day: 49, reading: 'Números 1;2;', summary: 'Ley y tabernáculo' },
    { day: 50, reading: 'Números 3;4;', summary: 'Ley y tabernáculo' },
    { day: 51, reading: 'Números 5;6;', summary: 'Ley y tabernáculo' },
    { day: 52, reading: 'Números 7', summary: 'Ley y tabernáculo' },
    { day: 53, reading: 'Números 8;9;10;', summary: 'Ley y tabernáculo' },
    { day: 54, reading: 'Números 11;12;13;', summary: 'Ley y tabernáculo' },
    { day: 55, reading: 'Números 14;15; Salmos 90', summary: 'Desde el desierto hasta Moab' },
    { day: 56, reading: 'Números 16;17;', summary: 'Desde el desierto hasta Moab' },
    { day: 57, reading: 'Números 18;19;20;', summary: 'Desde el desierto hasta Moab' },
    { day: 58, reading: 'Números 21;22;', summary: 'Desde el desierto hasta Moab' },
    { day: 59, reading: 'Números 23;24;25;', summary: 'Desde el desierto hasta Moab' },
    { day: 60, reading: 'Números 26;27;', summary: 'Desde el desierto hasta Moab' },
    { day: 61, reading: 'Números 28;29;30;', summary: 'Desde el desierto hasta Moab' },
    { day: 62, reading: 'Números 31;32;', summary: 'Desde el desierto hasta Moab' },
    { day: 63, reading: 'Números 33;34;', summary: 'Desde el desierto hasta Moab' },
    { day: 64, reading: 'Números 35;36;', summary: 'Desde el desierto hasta Moab' },
    { day: 65, reading: 'Deuteronomio 1;2;', summary: 'Desde el desierto hasta Moab' },
    { day: 66, reading: 'Deuteronomio 3;4;', summary: 'Desde el desierto hasta Moab' },
    { day: 67, reading: 'Deuteronomio 5;6;7;', summary: 'Desde el desierto hasta Moab' },
    { day: 68, reading: 'Deuteronomio 8;9;10;', summary: 'Desde el desierto hasta Moab' },
    { day: 69, reading: 'Deuteronomio 11;12;13;', summary: 'Desde el desierto hasta Moab' },
    { day: 70, reading: 'Deuteronomio 14;15;16;', summary: 'Desde el desierto hasta Moab' },
    { day: 71, reading: 'Deuteronomio 17;18;19;20;', summary: 'Desde el desierto hasta Moab' },
    { day: 72, reading: 'Deuteronomio 21;22;23;', summary: 'Desde el desierto hasta Moab' },
    { day: 73, reading: 'Deuteronomio 24;25;26;27;', summary: 'Desde el desierto hasta Moab' },
    { day: 74, reading: 'Deuteronomio 28;29;', summary: 'Final de Moisés' },
    { day: 75, reading: 'Deuteronomio 30;31;', summary: 'Final de Moisés' },
    { day: 76, reading: 'Deuteronomio 32;33;34;', summary: 'Final de Moisés' },
    { day: 77, reading: 'Josué 1;2;3;4;', summary: 'Final de Moisés' },
    { day: 78, reading: 'Josué 5;6;7;8;', summary: 'Final de Moisés' },
    { day: 79, reading: 'Josué 9;10;11;', summary: 'Final de Moisés' },
    { day: 80, reading: 'Josué 12;13;14;15;', summary: 'Final de Moisés' },
    { day: 81, reading: 'Josué 16;17;18;', summary: 'Final de Moisés' },
    { day: 82, reading: 'Josué 19;20;21;', summary: 'Final de Moisés' },
    { day: 83, reading: 'Josué 22;23;24;', summary: 'Final de Moisés' },
    { day: 84, reading: 'Jueces 1;2;3;', summary: 'Final de Moisés' },
    { day: 85, reading: 'Jueces 4;5;', summary: 'Jueces, Rut y Samuel' },
    { day: 86, reading: 'Jueces 6;7;', summary: 'Jueces, Rut y Samuel' },
    { day: 87, reading: 'Jueces 8;9;', summary: 'Jueces, Rut y Samuel' },
    { day: 88, reading: 'Jueces 10;11;12;', summary: 'Jueces, Rut y Samuel' },
    { day: 89, reading: 'Jueces 13;14;15;', summary: 'Jueces, Rut y Samuel' },
    { day: 90, reading: 'Jueces 16;17;18;', summary: 'Jueces, Rut y Samuel' },
    { day: 91, reading: 'Jueces 19;20;21;', summary: 'Jueces, Rut y Samuel' },
    { day: 92, reading: 'Rut 1;2;3;4;', summary: 'Jueces, Rut y Samuel' },
    { day: 93, reading: '1 Samuel 1;2;3;', summary: 'Jueces, Rut y Samuel' },
    { day: 94, reading: '1 Samuel 4;5;6;7;', summary: 'Jueces, Rut y Samuel' },
    { day: 95, reading: '1 Samuel 8;9;10;', summary: 'Jueces, Rut y Samuel' },
    { day: 96, reading: '1 Samuel 11;12;13;', summary: 'Jueces, Rut y Samuel' },
    { day: 97, reading: '1 Samuel 14;15;', summary: 'Jueces, Rut y Samuel' },
    { day: 98, reading: '1 Samuel 16;17;', summary: 'Jueces, Rut y Samuel' },
    { day: 99, reading: '1 Samuel 18;19;20; Salmos 11, 59', summary: 'Jueces, Rut y Samuel' },
    { day: 100, reading: '1 Samuel 21;22;23;24;', summary: 'Jueces, Rut y Samuel' },
    { day: 101, reading: 'Salmos 7, 27, 31, 34, 52', summary: 'Jueces, Rut y Samuel' },
    { day: 102, reading: '1 Samuel 25, 26, 27', summary: 'Jueces, Rut y Samuel' },
    { day: 103, reading: 'Salmos 17, 35, 54, 63', summary: 'Jueces, Rut y Samuel' },
    { day: 104, reading: '1 Samuel 28, 29, 30, 31', summary: 'Jueces, Rut y Samuel' },
    { day: 105, reading: '2 Samuel 1, 2,3', summary: 'Jueces, Rut y Samuel' },
    { day: 106, reading: '2 Samuel 4, 5, 6, 7', summary: 'Jueces, Rut y Samuel' },
    { day: 107, reading: '2 Samuel 8, 9, 10, 11, 12', summary: 'Jueces, Rut y Samuel' },
    { day: 108, reading: 'Salmos 51, 32, 86, 122', summary: 'Jueces, Rut y Samuel' },
    { day: 109, reading: '2 Samuel 13, 14, 15', summary: 'Jueces, Rut y Samuel' },
    { day: 110, reading: 'Salmos 3, 4, 12, 13, 28, 55', summary: 'Jueces, Rut y Samuel' },
    { day: 111, reading: '2 Samuel 16, 17, 18', summary: 'Reino de David y Salomón' },
    { day: 112, reading: 'Salmos 26, 40, 58, 61, 62, 64', summary: 'Reino de David y Salomón' },
    { day: 113, reading: '2 Samuel 19, 20, 21', summary: 'Reino de David y Salomón' },
    { day: 114, reading: 'Salmos 5, 38, 41, 42', summary: 'Reino de David y Salomón' },
    { day: 115, reading: '2 Samuel 22, 23, 24', summary: 'Reino de David y Salomón' },
    { day: 116, reading: 'Salmos 95, 96, 97, 98, 99, 100', summary: 'Reino de David y Salomón' },
    { day: 117, reading: '1 Crónicas 1, 2', summary: 'Reino de David y Salomón' },
    { day: 118, reading: '1 Crónicas 3, 4, 5', summary: 'Reino de David y Salomón' },
    { day: 119, reading: '1 Crónicas 6', summary: 'Reino de David y Salomón' },
    { day: 120, reading: '1 Crónicas 7, 8, 9, 10', summary: 'Reino de David y Salomón' },
    { day: 121, reading: '1 Crónicas 11, 12', summary: 'Reino de David y Salomón' },
    { day: 122, reading: '1 Crónicas 13, 14, , 15, 16', summary: 'Reino de David y Salomón' },
    { day: 123, reading: 'Salmos 96, 105, 106', summary: 'Reino de David y Salomón' },
    { day: 124, reading: '1 Crónicas 17, 18, 19, 20', summary: 'Reino de David y Salomón' },
    { day: 125, reading: '1 Crónicas 21, 22, 23', summary: 'Reino de David y Salomón' },
    { day: 126, reading: '1 Crónicas 24, 25, 26', summary: 'Reino de David y Salomón' },
    { day: 127, reading: '1 Crónicas 27, 28, 29', summary: 'Reino de David y Salomón' },
    { day: 128, reading: '1 Reyes 1, 2', summary: 'Reino de David y Salomón' },
    { day: 129, reading: '1 Reyes 3, 4', summary: 'Reino de David y Salomón' },
    { day: 130, reading: '1 Reyes 5, 6, 7', summary: 'Reino de David y Salomón' },
    { day: 131, reading: '1 Reyes 8, 9', summary: 'Reino de David y Salomón' },
    { day: 132, reading: '1 Reyes 10, 11; 2 Crónicas 1, 2, 3, 4, 5, 6, 7, 8, 9', summary: 'Reino de David y Salomón' },
    { day: 133, reading: 'Proverbios 1, 2, 3', summary: 'Reino de David y Salomón' },
    { day: 134, reading: 'Proverbios 4, 5, 6', summary: 'Reino de David y Salomón' },
    { day: 135, reading: 'Proverbios 7, 8, 9', summary: 'Reino de David y Salomón' },
    { day: 136, reading: 'Proverbios 10, 11, 12', summary: 'Reino de David y Salomón' },
    { day: 137, reading: 'Proverbios 13, 14, 15', summary: 'Reino de David y Salomón' },
    { day: 138, reading: 'Proverbios 16, 17, 18', summary: 'Reino de David y Salomón' },
    { day: 139, reading: 'Proverbios 19, 20, 21', summary: 'Reino de David y Salomón' },
    { day: 140, reading: 'Proverbios 22, 23, 24', summary: 'Reino de David y Salomón' },
    { day: 141, reading: 'Proverbios 25, 26, 27', summary: 'Reino de David y Salomón' },
    { day: 142, reading: 'Proverbios 28, 29, 20, 31', summary: 'Reino de David y Salomón' },
    { day: 143, reading: 'Eclesiastés 1, 2, 3, 4, 5, 6', summary: 'Reino de David y Salomón' },
    { day: 144, reading: 'Eclesiastés 7, 8, 9, 10, 11, 12', summary: 'Reino de David y Salomón' },
    { day: 145, reading: 'Cantar de los Cantares 1, 2, 3, 4, 5, 6, 7, 8', summary: 'Reino de David y Salomón' },
    { day: 146, reading: '1 Reyes 12, 13, 14', summary: 'Reino de David y Salomón' },
    { day: 147, reading: '1 Reyes 15, 16, 17', summary: 'Reino de David y Salomón' },
    { day: 148, reading: '1 Reyes 18, 19, 20', summary: 'Reino de David y Salomón' },
    { day: 149, reading: '1 Reyes 21, 22', summary: 'Reino de David y Salomón' },
    { day: 150, reading: '2 Reyes 1, 2, 3', summary: 'Reino de David y Salomón' },
    { day: 151, reading: '2 Reyes 4, 5, 6, 7', summary: 'Reyes, Profetas y Exilio' },
    { day: 152, reading: '2 Reyes 8, 9, 10, 11', summary: 'Reyes, Profetas y Exilio' },
    { day: 153, reading: '2 Reyes 12, 13, 14', summary: 'Reyes, Profetas y Exilio' },
    { day: 154, reading: 'Amós 1, 2, 3, 4, 5', summary: 'Reyes, Profetas y Exilio' },
    { day: 155, reading: 'Amós 6, 7, 8, 9', summary: 'Reyes, Profetas y Exilio' },
    { day: 156, reading: '2 Crónicas 26', summary: 'Reyes, Profetas y Exilio' },
    { day: 157, reading: 'Isaías 1, 2, 3, 4', summary: 'Reyes, Profetas y Exilio' },
    { day: 158, reading: 'Isaías 5, 6, 7, 8', summary: 'Reyes, Profetas y Exilio' },
    { day: 159, reading: 'Oseas 1, 2, 3, 4, 5, 6, 7', summary: 'Reyes, Profetas y Exilio' },
    { day: 160, reading: 'Oseas 8, 9, 10, 11, 12, 13, 14', summary: 'Reyes, Profetas y Exilio' },
    { day: 161, reading: 'Miqueas 1, 2, 3, 4, 5, 6, 7', summary: 'Reyes, Profetas y Exilio' },
    { day: 162, reading: '2 Reyes 15, 16, 17', summary: 'Reyes, Profetas y Exilio' },
    { day: 163, reading: '2 Reyes 18, 19', summary: 'Reyes, Profetas y Exilio' },
    { day: 164, reading: 'Isaías 36, 37', summary: 'Reyes, Profetas y Exilio' },
    { day: 165, reading: '2 Reyes 20; Isaías 38, 39', summary: 'Reyes, Profetas y Exilio' },
    { day: 166, reading: 'Isaías 40, 42, 43', summary: 'Reyes, Profetas y Exilio' },
    { day: 167, reading: 'Isaías 44, 45, 46, 47, 48', summary: 'Reyes, Profetas y Exilio' },
    { day: 168, reading: '2 Reyes 21, 22, 23', summary: 'Reyes, Profetas y Exilio' },
    { day: 169, reading: 'Sofonías 1, 2, 3', summary: 'Reyes, Profetas y Exilio' },
    { day: 170, reading: 'Jeremías 1, 2, 3', summary: 'Reyes, Profetas y Exilio' },
    { day: 171, reading: 'Jeremías 4, 5, 6', summary: 'Reyes, Profetas y Exilio' },
    { day: 172, reading: 'Jeremías 7, 8, 9', summary: 'Reyes, Profetas y Exilio' },
    { day: 173, reading: 'Jeremías 10, 11, 12, 13', summary: 'Reyes, Profetas y Exilio' },
    { day: 174, reading: 'Nahúm 1, 2, 3', summary: 'Reyes, Profetas y Exilio' },
    { day: 175, reading: '2 Reyes 24, 25; 2 Crónicas 36', summary: 'Reyes, Profetas y Exilio' },
    { day: 176, reading: 'Habacuc 1, 2, 3', summary: 'Reyes, Profetas y Exilio' },
    { day: 177, reading: 'Lamentaciones 1, 2, 3', summary: 'Reyes, Profetas y Exilio' },
    { day: 178, reading: 'Lamentaciones 4, 5', summary: 'Reyes, Profetas y Exilio' },
    { day: 179, reading: 'Ezequiel 1, 2, 3, 4', summary: 'Reyes, Profetas y Exilio' },
    { day: 180, reading: 'Ezequiel 5, 6, 7, 8', summary: 'Reyes, Profetas y Exilio' },
    { day: 181, reading: 'Ezequiel 9, 10, 11, 12', summary: 'Reyes, Profetas y Exilio' },
    { day: 182, reading: 'Ezequiel 13, 14, 15', summary: 'Reyes, Profetas y Exilio' },
    { day: 183, reading: 'Ezequiel 16, 17, 18', summary: 'Reyes, Profetas y Exilio' },
    { day: 184, reading: 'Ezequiel 19, 20, 21', summary: 'Reyes, Profetas y Exilio' },
    { day: 185, reading: 'Ezequiel 22, 23, 24', summary: 'Reyes, Profetas y Exilio' },
    { day: 186, reading: 'Daniel 1, 2, 3', summary: 'Reyes, Profetas y Exilio' },
    { day: 187, reading: 'Daniel 4, 5, 6', summary: 'Reyes, Profetas y Exilio' },
    { day: 188, reading: 'Daniel 7, 8, 9', summary: 'Reyes, Profetas y Exilio' },
    { day: 189, reading: 'Daniel 10, 11, 12', summary: 'Reyes, Profetas y Exilio' },
    { day: 190, reading: 'Esdras 1, 2, 3', summary: 'Retorno del Exilio' },
    { day: 191, reading: 'Esdras 4, 5, 6', summary: 'Retorno del Exilio' },
    { day: 192, reading: 'Hageo 1, 2', summary: 'Retorno del Exilio' },
    { day: 193, reading: 'Zacarías 1, 2, 3, 4, 5, 6, 7', summary: 'Retorno del Exilio' },
    { day: 194, reading: 'Zacarías 8, 9, 10, 11, 12, 13, 14', summary: 'Retorno del Exilio' },
    { day: 195, reading: 'Ester 1, 2, 3, 4, 5', summary: 'Retorno del Exilio' },
    { day: 196, reading: 'Ester 6, 7, 8, 9, 10', summary: 'Retorno del Exilio' },
    { day: 197, reading: 'Nehemías 1, 2, 3, 4', summary: 'Retorno del Exilio' },
    { day: 198, reading: 'Nehemías 5, 6, 7', summary: 'Retorno del Exilio' },
    { day: 199, reading: 'Nehemías 8, 9, 10', summary: 'Retorno del Exilio' },
    { day: 200, reading: 'Nehemías 11, 12, 13', summary: 'Retorno del Exilio' },
    { day: 201, reading: 'Malaquías 1, 2, 3, 4', summary: 'Retorno del Exilio' },
    { day: 202, reading: 'Esdras 7, 8, 9, 10', summary: 'Retorno del Exilio' },
    { day: 203, reading: 'Nehemías 1, 2, 3, 4', summary: 'Retorno del Exilio' },
    { day: 204, reading: 'Nehemías 5, 6, 7', summary: 'Retorno del Exilio' },
    { day: 205, reading: 'Nehemías 8, 9, 10', summary: 'Retorno del Exilio' },
    { day: 206, reading: 'Nehemías 11, 12, 13', summary: 'Retorno del Exilio' },
    { day: 207, reading: 'Malaquías 1, 2, 3, 4', summary: 'Retorno del Exilio' },
    // ... Días 208–300
    { day: 208, reading: "Juan 1; Marcos 1; Mateo 1; Lucas 1", summary: "Evangelios en Armonía" },
    { day: 209, reading: "Mateo 2, 3; Lucas 2, 3", summary: "Evangelios en Armonía" },
    { day: 210, reading: "Juan 2, 3, 4", summary: "Evangelios en Armonía" },
    { day: 211, reading: "Marcos 2; Mateo 4; Lucas 4, 5; Juan 5", summary: "Evangelios en Armonía" },
    { day: 212, reading: "Marcos 3; Mateo 12; Lucas 6", summary: "Evangelios en Armonía" },
    { day: 213, reading: "Mateo 5, 6, 7", summary: "Evangelios en Armonía" },
    { day: 214, reading: "Mateo 8; Marcos 4, 5", summary: "Evangelios en Armonía" },
    { day: 215, reading: "Marcos 6; Mateo 9, 10", summary: "Evangelios en Armonía" },
    { day: 216, reading: "Mateo 11; Mateo 13", summary: "Evangelios en Armonía" },
    { day: 217, reading: "Marcos 7; Mateo 15", summary: "Evangelios en Armonía" },
    { day: 218, reading: "Mateo 16; Marcos 8; Lucas 9", summary: "Evangelios en Armonía" },
    { day: 219, reading: "Mateo 17; Marcos 9", summary: "Evangelios en Armonía" },
    { day: 220, reading: "Juan 6", summary: "Evangelios en Armonía" },
    { day: 221, reading: "Juan 7, 8", summary: "Evangelios en Armonía" },
    { day: 222, reading: "Juan 9, 10", summary: "Evangelios en Armonía" },
    { day: 223, reading: "Lucas 10, 11", summary: "Evangelios en Armonía" },
    { day: 224, reading: "Lucas 12, 13", summary: "Evangelios en Armonía" },
    { day: 225, reading: "Juan 11", summary: "Evangelios en Armonía" },
    { day: 226, reading: "Lucas 14, 15", summary: "Evangelios en Armonía" },
    { day: 227, reading: "Lucas 16, 17", summary: "Evangelios en Armonía" },
    { day: 228, reading: "Juan 12", summary: "Evangelios en Armonía" },
    { day: 229, reading: "Mateo 21; Marcos 11; Lucas 19", summary: "Evangelios en Armonía" },
    { day: 230, reading: "Mateo 22; Marcos 12; Lucas 20", summary: "Evangelios en Armonía" },
    { day: 231, reading: "Mateo 23, 24; Marcos 13", summary: "Evangelios en Armonía" },
    { day: 232, reading: "Juan 13, 14, 15", "summary": "Evangelios en Armonía" },
    { day: 233, reading: "Juan 16, 17, 18", "summary": "Evangelios en Armonía" },
    { day: 234, reading: "Mateo 26; Marcos 14; Lucas 22", "summary": "Evangelios en Armonía" },
    { day: 235, reading: "Juan 19; Mateo 27; Marcos 15; Lucas 23", "summary": "Evangelios en Armonía" },
    { day: 236, reading: "Juan 20, 21; Mateo 28; Marcos 16; Lucas 24", "summary": "Evangelios en Armonía" },
    { day: 237, reading: "Hechos 1, 2, 3", "summary": "Hechos y las Cartas" },
    { day: 238, reading: "Hechos 4, 5, 6", "summary": "Hechos y las Cartas" },
    { day: 239, reading: "Hechos 7, 8", "summary": "Hechos y las Cartas" },
    { day: 240, reading: "Hechos 9, 10", "summary": "Hechos y las Cartas" },
    { day: 241, reading: "Hechos 11, 12", "summary": "Hechos y las Cartas" },
    { day: 242, reading: "Hechos 13, 14; Gálatas 1, 2, 3", "summary": "Hechos y las Cartas" },
    { day: 243, reading: "Gálatas 4, 5, 6", "summary": "Hechos y las Cartas" },
    { day: 244, reading: "Hechos 15, 16", "summary": "Hechos y las Cartas" },
    { day: 245, reading: "1 Tesalonicenses 1, 2, 3, 4, 5; 2 Tesalonicenses 1, 2, 3;", "summary": "Hechos y las Cartas" },
    { day: 246, reading: "Hechos 17, 18", "summary": "Hechos y las Cartas" },
    { day: 247, reading: "1 Corintios 1, 2, 3, 4, 5, 6, 7, 8", "summary": "Hechos y las Cartas" },
    { day: 248, reading: "1 Corintios 9, 10, 11, 12, 13, 14, 15, 16", "summary": "Hechos y las Cartas" },
    { day: 249, reading: "2 Corintios 1, 2, 3, 4, 5, 6, 7", "summary": "Hechos y las Cartas" },
    { day: 250, reading: "2 Corintios 8, 9, 10, 11, 12, 13", "summary": "Hechos y las Cartas" },
    { day: 251, reading: "Romanos 1, 2, 3, 4, 5, 6, 7, 8", "summary": "Hechos y las Cartas" },
    { day: 252, reading: "Romanos 9, 10, 11, 12, 13, 14, 15, 16", "summary": "Hechos y las Cartas" },
    { day: 253, reading: "Hechos 19, 20", "summary": "Hechos y las Cartas" },
    { day: 254, reading: "Hechos 21, 22, 23", "summary": "Hechos y las Cartas" },
    { day: 255, reading: "Hechos 24, 25, 26", "summary": "Hechos y las Cartas" },
    { day: 256, reading: "Hechos 27, 28", "summary": "Hechos y las Cartas" },
    { day: 257, reading: "Colosenses 1, 2, 3, 4; Filemón 1;", "summary": "Hechos y las Cartas" },
    { day: 258, reading: "Efesios 1, 2, 3, 4, 5, 6;", "summary": "Hechos y las Cartas" },
    { day: 259, reading: "Filipenses 1, 2, 3, 4;", "summary": "Hechos y las Cartas" },
    { day: 260, reading: "1 Timoteo 1, 2, 3, 4, 5, 6", "summary": "Hechos y las Cartas" },
    { day: 261, reading: "Tito 1, 2, 3", "summary": "Hechos y las Cartas" },
    { day: 262, reading: "1 Pedro 1, 2, 3, 4, 5", "summary": "Cartas Generales" },
    { day: 263, reading: "Hebreos 1, 2, 3, 4, 5, 6, 7", "summary": "Cartas Generales" },
    { day: 264, reading: "Hebreos 8, 9, 10, 11, 12, 13", "summary": "Cartas Generales" },
    { day: 265, reading: "2 Timoteo 1, 2, 3, 4", "summary": "Cartas Generales" },
    { day: 266, reading: "2 Pedro 1, 2, 3", "summary": "Cartas Generales" },
    { day: 267, reading: "Judas 1", "summary": "Cartas Generales" },
    { day: 268, reading: "1 Juan 1, 2, 3, 4, 5; 2 Juan 1; 3 Juan 1;", "summary": "Cartas Generales" },
    { day: 269, reading: "Apocalipsis 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 11;", "summary": "Apocalipsis" },
    { day: 270, reading: "Apocalipsis 12, 13, 14, 15, 16, 17, 18, 19 20, 21, 22", "summary": "Apocalipsis" },
];

interface PassageVerse {
    book: string;
    chapter: number;
    verse: number;
    text: string;
}

export default function ChronologicalPlanPage() {
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
  const router = useRouter();
  const { toast } = useToast();

  const toggleDayCompletion = (day: number) => {
    setCompletedDays(
      completedDays.includes(day)
        ? completedDays.filter((d) => d !== day)
        : [...completedDays, day]
    );
  };

  const progressPercentage = (completedDays.length / planDays.length) * 100;

  const handleReadPassage = (reading: string): PassageVerse[] => {
    const allVerses: PassageVerse[] = [];
    let currentBookKey = '';
  
    const references = reading.split(';').map(r => r.trim());
  
    for (const ref of references) {
      let passage = ref;
      const bookMatch = ref.match(/^(\d?\s?[a-zA-Záéíóúñ]+)\s/);
  
      if (bookMatch && bookMatch[1]) {
        const bookName = bookMatch[1].trim().toLowerCase();
        if (bibleData[bookName]) {
          currentBookKey = bookName;
          passage = ref.substring(bookMatch[0].length).trim();
        }
      }
  
      if (!currentBookKey) continue;
  
      const book = bibleData[currentBookKey];
      const passageParts = passage.split(',').map(p => p.trim());
  
      for (const part of passageParts) {
        let match;
  
        match = part.match(/^(\d+)-(\d+)$/);
        if (match) {
          const startChapter = parseInt(match[1], 10);
          const endChapter = parseInt(match[2], 10);
          for (let c = startChapter; c <= endChapter; c++) {
            const verses = book.chapters[c - 1] || [];
            verses.forEach((text: string, i: number) => {
              allVerses.push({ book: currentBookKey, chapter: c, verse: i + 1, text });
            });
          }
          continue;
        }
  
        match = part.match(/^(\d+)$/);
        if (match) {
          const chapter = parseInt(match[1], 10);
          const verses = book.chapters[chapter - 1] || [];
          verses.forEach((text: string, i: number) => {
            allVerses.push({ book: currentBookKey, chapter, verse: i + 1, text });
          });
        }
      }
    }
    return allVerses;
  };

  if (selectedDay) {
    const dayData = planDays.find(d => d.day === selectedDay);
    if (!dayData) return null;

    const verses = handleReadPassage(dayData.reading);

    return (
      <div className="container mx-auto px-4 py-12 md:px-6">
        <div className="max-w-3xl mx-auto">
          <Button onClick={() => setSelectedDay(null)} variant="outline" className="mb-4">
            &larr; Volver al plan
          </Button>
          <h1 className="text-4xl font-bold font-headline text-center mb-2">{dayData.reading}</h1>
          <p className="text-center text-muted-foreground mb-8">{dayData.summary}</p>
          
          <Card>
            <CardContent className="p-6 space-y-4 text-lg leading-relaxed">
              {verses.length > 0 ? verses.map((v, index) => (
                <p key={index}>
                  <sup className="font-bold mr-2">{v.book.charAt(0).toUpperCase() + v.book.slice(1)} {v.chapter}:{v.verse}<br /></sup>
                  {v.text}
                </p>
              )) : <p>No se encontró el contenido para este día.</p>}
            </CardContent>
          </Card>
          <div className="flex justify-center mt-6">
            <Button onClick={() => {
                toggleDayCompletion(selectedDay);
                setSelectedDay(null);
            }}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {completedDays.includes(selectedDay) ? 'Marcar como no completado' : 'Marcar como completado'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <div className="max-w-4xl mx-auto">
        <Button onClick={() => router.back()} variant="outline" className="mb-4">
            &larr; Regresar
        </Button>
        <h1 className="text-4xl font-bold font-headline text-center mb-4">
            PLAN CRONOLÓGICO DE LA BIBLIA – 365 DÍAS
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          (Lectura aproximada: 3–4 capítulos por día)
        </p>

        <div className="mb-8">
            <Progress value={progressPercentage} className="w-full" />
            <p className="text-sm text-muted-foreground text-center mt-2">{Math.round(progressPercentage)}% completado ({completedDays.length} de {planDays.length} días)</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {planDays.map((item) => (
            <Card 
              key={item.day} 
              className={`cursor-pointer transition-all hover:shadow-lg ${completedDays.includes(item.day) ? 'bg-green-100 dark:bg-green-900/30' : ''}`}
              onClick={() => setSelectedDay(item.day)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Día {item.day}</span>
                  {completedDays.includes(item.day) && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.reading}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
