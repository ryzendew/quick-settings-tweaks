import { featureReloader } from "../libs/utility.js"
import { VolumeMixer } from "../libs/volumeMixerHandler.js"
import { QuickSettingsGrid, QuickSettings, InputStreamSlider } from "../libs/gnome.js"

export class VolumeMixerFeature {
    onMenuOpen() {
        // reorder on menu open
        if (this.volumeMixer) {
            QuickSettingsGrid.set_child_below_sibling(
                this.volumeMixer.actor,
                this._getInputStreamSlider()
            )
        }
    }

    _getInputStreamSlider() {
        return this.inputStreamSlider
            || (this.inputStreamSlider = QuickSettingsGrid.get_children().find((child)=>child.constructor?.name == "InputStreamSlider"))
    }

    load() {
        let settings = this.settings

        // setup reloader
        featureReloader.enableWithSettingKeys(this, [
            "volume-mixer-enabled",
            "volume-mixer-position",
            "volume-mixer-filtered-apps",
            "volume-mixer-show-description",
            "volume-mixer-show-icon",
            "volume-mixer-filter-mode",
            "volume-mixer-use-regex",
            "volume-mixer-check-description"
        ])

        // check is feature enabled
        if (!this.settings.get_boolean("volume-mixer-enabled")) return

        // Make volume mixer
        this.volumeMixer = new VolumeMixer({
            'volume-mixer-filtered-apps': settings.get_strv("volume-mixer-filtered-apps"),
            'volume-mixer-filter-mode': settings.get_string("volume-mixer-filter-mode"),
            'volume-mixer-show-description': settings.get_boolean("volume-mixer-show-description"),
            'volume-mixer-show-icon': settings.get_boolean("volume-mixer-show-icon"),
            'volume-mixer-check-description': settings.get_boolean("volume-mixer-check-description"),
            'volume-mixer-use-regex': settings.get_boolean("volume-mixer-use-regex")
        })

        // Insert volume mixer into Quick Settings
        QuickSettings.menu.addItem(this.volumeMixer.actor, 2);
        if (this.settings.get_string("volume-mixer-position") === "top") {
            QuickSettings.menu._grid.set_child_above_sibling(
                this.volumeMixer.actor,
                InputStreamSlider
            )

        }
    }

    unload() {
        // disable feature reloader
        featureReloader.disable(this)
        if (this.volumeMixer) this.volumeMixer.destroy();
        this.volumeMixer = null;
    }
}
