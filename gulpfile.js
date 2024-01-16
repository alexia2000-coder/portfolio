// Gulp.js configuration

// modules
const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const newer = require('gulp-newer');                  // https://www.npmjs.com/package/gulp-newer
const imagemin = require('gulp-imagemin');            // https://www.npmjs.com/package/gulp-imagemin
const htmlclean = require('gulp-htmlclean');          // https://www.npmjs.com/package/gulp-htmlclean
const stripdebug = require('gulp-strip-debug');       // https://www.npmjs.com/package/gulp-strip-debug
const uglify = require('gulp-uglify');                // https://www.npmjs.com/package/gulp-uglify
const sourcemaps = require('gulp-sourcemaps');        // https://www.npmjs.com/package/gulp-sourcemaps
const sass = require('gulp-sass')(require('sass'));                    // https://www.npmjs.com/package/gulp-sass
const postcss = require('gulp-postcss');              // https://github.com/postcss/gulp-postcss
const autoprefixer = require('autoprefixer');         //https://www.npmjs.com/package/autoprefixer
const cssnano = require('cssnano');                   // https://www.npmjs.com/package/cssnano
const os = require('os');



// Dossiers du projet - Toujours travailler dans le dossier src, jamais dans le dossier dist
const folder = {
    src: 'src/',
    dist: 'dist/'
};


// Commande pour copier le normalize.css du dossier node-modules vers le dossier dist
const copier_normalize = function(){
    return gulp.src('node_modules/normalize.css/normalize.css')
        .pipe(gulp.dest(folder.dist +'/css'))
};

// Processus dâ€™optimisation des images
const optimiser_images = function() {
    var out = folder.dist + 'images/';

    return gulp.src(folder.src + 'images/**/*')     //RÃ©cupÃ¨re tous les fichiers du dossier et des sous-dossiers.
        .pipe(newer(out))                           //Permets de traiter seulement les nouveaux fichiers ou ceux qui ont Ã©tÃ© modifiÃ©s.
        .pipe(imagemin({ optimizationLevel: 7 }))   //Optimisation des fichiers images au format PNG, JPEG, GIF et SVG.
        .pipe(gulp.dest(out));                      //Copie tous les fichiers optimisÃ©s vers la destination.
};

// Processus dâ€™optimisation du HTML
const optimiser_html = function() {
    var out = folder.dist;

    return gulp.src(folder.src + '/**/*.html')      //RÃ©cupÃ¨re tous les fichiers du dossier et des sous-dossiers.
        .pipe(newer(out))                           //Permets de traiter seulement les nouveaux fichiers ou ceux qui ont Ã©tÃ© modifiÃ©s.
        .pipe(htmlclean())                          //Reformate le html sur une seule ligne
        .pipe(gulp.dest(out));                      //Copie tous les fichiers optimisÃ©s vers la destination.


};

// Processus dâ€™optimisation du CSS
const optimiser_css = function() {

    var postCssOpts = [
        autoprefixer({ overrideBrowserslist: ['last 2 versions', '> 2%'] })
        //,cssnano
    ];

    return gulp.src(folder.src + 'scss/main.scss')
        .pipe(sourcemaps.init())                    //Permets de retrouver la ligne problÃ©matique dans le fichier original.
        .pipe(sass({                                //Fais la compilation des fichiers SASS
            outputStyle: 'expanded',
            imagePath: 'images/',
            precision: 4,
            errLogToConsole: true
        }))
        .pipe(postcss(postCssOpts))                 //Permet de faire des actions sur le css comme l'autoprefixeur et la compression du code
        .pipe(sourcemaps.write())                   //Permets de retrouver la ligne problÃ©matique dans le fichier original.
        .pipe(gulp.dest(folder.dist + 'css/'));

};


// Processus dâ€™optimisation du JavaScript
const optimiser_js = function() {
    var out = folder.dist;

    return gulp.src(folder.src + 'js/**/*')         //RÃ©cupÃ¨re tous les fichiers du dossier et des sous-dossiers.
        .pipe(sourcemaps.init())                    //Permets de retrouver la ligne problÃ©matique dans le fichier original.
        // enlever le commentaire de stripdebug avant de mettre en ligne
        //.pipe(stripdebug())                         //Supprime tous les commentaires et les lignes de Â«Â dÃ©bogageÂ Â»
        //.pipe(uglify())                             //Reformate le script sur une seule ligne
        .pipe(sourcemaps.write())                   //Permets de retrouver la ligne problÃ©matique dans le fichier original.
        .pipe(gulp.dest(out + 'js/'));              //Copie tous les fichiers optimisÃ©s vers la destination.
};

// Processus qui vÃ©rifie s'il y a eu un changement dans le dossier et exÃ©cute le processus qui s'y rattache
const watch = function() {

    // image changes
    gulp.watch(folder.src + 'images/**/*', gulp.parallel(optimiser_images));

    // html changes
    gulp.watch(folder.src + '**/*', gulp.parallel(optimiser_html));

    // javascript changes
    gulp.watch(folder.src + 'js/**/*', gulp.parallel(optimiser_js));

    // css changes
    gulp.watch(folder.src + 'scss/**/*', gulp.parallel(optimiser_css));

};

//Processus qui lance le serveur Web local et qui recharge la page lorsqu'il y a un changement avec les fichiers CSS, HTML et JS
const serveur = function () {

    var navigateur = "Firefox";
    // Si la plateform est un OSX
    if(os.platform() == "darwin"){
        navigateur = ["google chrome"];
    }
    else {
        navigateur = ["chrome"];
    }


    //Lancement du serveur
    browserSync.init({
        port: 3000,
        server: "./dist/",
        ghostMode: false,
        notify: false,
        browser: navigateur
    });

    //VÃ©rification si quelque chose change et recharge la page
    gulp.watch('**/*.css').on('change', browserSync.reload);
    gulp.watch('**/*.html').on('change', browserSync.reload);
    gulp.watch('**/*.js').on('change', browserSync.reload);

};


gulp.task('copier_normalize', copier_normalize);
gulp.task('optimiser_images', optimiser_images);
gulp.task('optimiser_html', gulp.series('optimiser_images', optimiser_html));
gulp.task('optimiser_css', gulp.series('optimiser_images', optimiser_css));
gulp.task('optimiser_js', optimiser_js);
gulp.task('watch', watch);
gulp.task('serveur', serveur);


// Processus pour exÃ©cuter chaque tÃ¢che peut importe l'ordre
gulp.task('execution', gulp.parallel('optimiser_html', 'optimiser_css', 'optimiser_js', 'copier_normalize'));


// Processus par dÃ©faut qui exÃ©cute chaque tÃ¢che une aprÃ¨s l'autre
gulp.task('default', gulp.series( 'execution', gulp.parallel('watch', 'serveur')));